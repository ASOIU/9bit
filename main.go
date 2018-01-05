package main

import (
	"os"
	"encoding/xml"
	"time"
	"net/url"
	"strconv"
	"strings"
	"sort"
	"regexp"
	"sync"
	"log"

	"github.com/pkg/errors"
)

// Support for XML namespace prefixes:
// - https://github.com/golang/go/issues/9519
// - https://github.com/golang/go/issues/6800
// Support XML namespaces [solution]
// - https://github.com/golang/go/issues/6517#issuecomment-66086419
// - https://stackoverflow.com/questions/33656596/unmarshal-an-xml-document-with-xmlns-namespaces/33656859#33656859

// Parsing Big/Huge/Fat XML Files With Go:
// - http://blog.davidsingleton.org/parsing-huge-xml-files-with-go/
// - https://github.com/dps/go-xml-parse/blob/master/go-xml-parse.go

// Decode XML performance in golang:
// - https://groups.google.com/forum/#!topic/golang-nuts/XrK5OwHiN_M
// - https://play.golang.org/p/J8hFZyyFF8

// XML Schema and Go:
// - https://blog.aqwari.net/xml-schema-go/
// - https://godoc.org/aqwari.net/xml/xsdgen
// - https://github.com/droyo/go-xml/


/* Check-list:
 * TODO[x]: https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully
/*/


type (
	WpRFC3339Date struct{
		time.Time // http://www.hydrogen18.com/blog/golang-embedding.html  By-Value
		          // https://stackoverflow.com/questions/34079466/golang-embedded-struct/34083564#34083564
		          // https://stackoverflow.com/questions/45898990/understanding-struct-embedding/45899201#45899201
	}
	PostComment struct{
		Id          int           `xml:"http://wordpress.org/export/1.2/ comment_id"`
	//	UserName    string        `xml:"http://wordpress.org/export/1.2/ comment_author"`
	//	UserEmail   string        `xml:"http://wordpress.org/export/1.2/ comment_author_email"`
		DateGmt     WpRFC3339Date `xml:"http://wordpress.org/export/1.2/ comment_date_gmt"`
		Content     string        `xml:"http://wordpress.org/export/1.2/ comment_content"`
	//	Approved    int           `xml:"http://wordpress.org/export/1.2/ comment_approved"` // "spam" filtered out (see "export.php")
	//	UserId      int           `xml:"http://wordpress.org/export/1.2/ comment_user_id"`
		UserLogin   string        `xml:"http://wordpress.org/export/1.2/ comment_user_login"`
	}
	PostTerm struct{
		Domain string `xml:"domain,attr"`
		Name   string `xml:",chardata"`
	}
	Post struct{
		XMLName           xml.Name      `xml:"item"`
		Title             string        `xml:"title"`
		UserLogin         string        `xml:"http://purl.org/dc/elements/1.1/ creator"`
		Content           string        `xml:"http://purl.org/rss/1.0/modules/content/ encoded"`
		Id                int           `xml:"http://wordpress.org/export/1.2/ post_id"`
		PublishDateGmt    WpRFC3339Date `xml:"http://wordpress.org/export/1.2/ post_date_gmt"`
		LastEditDateGmt   WpRFC3339Date `xml:"http://wordpress.org/export/1.2/ post_modified_gmt"`
	//	UserId            int           `xml:"http://wordpress.org/export/1.2/ post_author"`
		Slug              string        `xml:"http://wordpress.org/export/1.2/ post_name"`
		Status            string        `xml:"http://wordpress.org/export/1.2/ status"`               // inherit (attachment), draft, pending, publish, private
		Type              string        `xml:"http://wordpress.org/export/1.2/ post_type"`            // attachment, page, post
		Categories      []string        `xml:"http://wordpress.org/export/1.2/ taxonomies>category"`
		Tags            []string        `xml:"http://wordpress.org/export/1.2/ taxonomies>tag"`
	//	Terms           []PostTerm      `xml:"http://wordpress.org/export/1.2/ taxonomies>term"`
		Comments          Comments      `xml:"http://wordpress.org/export/1.2/ comment"`
	}
	Tag struct{
		XMLName     xml.Name `xml:"http://wordpress.org/export/1.2/ tag"`
		Name        string   `xml:"http://wordpress.org/export/1.2/ tag_name"`
	}
	Category struct{
		XMLName     xml.Name `xml:"http://wordpress.org/export/1.2/ category"`
		Parent      string   `xml:"http://wordpress.org/export/1.2/ category_parent"`
		Slug        string   `xml:"http://wordpress.org/export/1.2/ category_nicename"`
		Name        string   `xml:"http://wordpress.org/export/1.2/ cat_name"`
		Description string   `xml:"http://wordpress.org/export/1.2/ category_description"`
	}
	User struct{
		XMLName             xml.Name `xml:"http://wordpress.org/export/1.2/ user"`
		Login               string   `xml:"http://wordpress.org/export/1.2/ user_login"`
		GravatarEmailHash   string   `xml:"http://wordpress.org/export/1.2/ user_gravatar_email_hash"`
		GravatarServerRnd   string   `xml:"http://wordpress.org/export/1.2/ user_gravatar_server_rnd"`
		DisplayName         string   `xml:"http://wordpress.org/export/1.2/ user_display_name"`
	}
	ItemDecoder     struct{}
	TagDecoder      struct{}
	CategoryDecoder struct{}
	UserDecoder     struct{}
	Rss struct{
		User     UserDecoder     `xml:"http://wordpress.org/export/1.2/ channel>user"`
		Category CategoryDecoder `xml:"http://wordpress.org/export/1.2/ channel>category"`
		Tag      TagDecoder      `xml:"http://wordpress.org/export/1.2/ channel>tag"`
		Item     ItemDecoder     `xml:"channel>item"`     // <- produce the same side effect as "Item []Item"
		XMLName  xml.Name        `xml:"rss"`              // <- see "Padding is hard"
	}
)
//NOTE: во всех структурах (кроме "User") мне нужны только логины пользователей (автор, юзер) https://github.com/jekyll/jekyll-feed#author-information

type (
	Comments []*PostComment
	CommentsByDateGmt struct{ Comments }
	CommentsById      struct{ Comments }
)
func (c Comments) Len() int      { return len(c); }
func (c Comments) Swap(i, j int) { c[i], c[j] = c[j], c[i]; }

func (c CommentsByDateGmt) Less(i, j int) bool { return c.Comments[i].DateGmt.Before(c.Comments[j].DateGmt.Time); }
func (c CommentsById     ) Less(i, j int) bool { return c.Comments[i].Id           < c.Comments[j].Id;            }

func (d *WpRFC3339Date) UnmarshalText(data []byte) (err error) {
	var value = string(data);

	// time.RFC3339: "T"->space, w/o time zone
	d.Time, err = time.ParseInLocation("2006-01-02 15:04:05", string(data), time.UTC);

	if err != nil && value == "0000-00-00 00:00:00" { // err: month out of range
		d.Time = time.Time{};
		err = nil;
	}else{
		err = errors.Wrap(err, "cant't parse WP post date");
	}

	return;
}


func (*TagDecoder) UnmarshalXML(d *xml.Decoder, start xml.StartElement) (err error) {
	var t Tag;

	if err = d.DecodeElement(&t, &start); err != nil {
		err = errors.Wrap(err, "cant't decode <wp:tag>");
		return;
	}

	var out = []byte(
		"---"   +"\n"+
		"---"   +"\n");

	MustWriteFileAsync(&decodersGroup, exportDir+"/"+"_tags_", t.Name+".html", time.Now(), out);

	return;
}


var collectionFor map[string]string;
var collections   map[string]string;

func (*CategoryDecoder) UnmarshalXML(d *xml.Decoder, start xml.StartElement) (err error) {
	var (
		collectionName, fileName string
		out []byte
	);{
		var c Category;

		if err = d.DecodeElement(&c, &start); err != nil {
			err = errors.Wrap(err, "cant't decode <wp:category>");
			return;
		}


		var addCollection = func(slug string) string { // save address of first added string (slug)
			var s, exist = collections[slug];
			if !exist {
				collections[slug] = slug;
				return slug;
			}
			return s; // return address of first added string (slug)
		}


		if c.Parent == "" {
			addCollection(c.Slug);
			return;
		}

		collectionFor[c.Name] = addCollection(c.Parent); // all records (in 'collectionFor') of the same collection
		                                                 // -> point to the same "string" memory address

		out = []byte(
			"---"   +"\n"+
			"---"   +"\n"+
			c.Description);

		collectionName = c.Parent;
		fileName       = c.Name
	}

	MustWriteFileAsync(&decodersGroup, exportDir+"/"+"_"+collectionName+"_", fileName+".html", time.Now(), out);

	return;
}


var peopleDataFile *os.File;

func (*UserDecoder) UnmarshalXML(d *xml.Decoder, start xml.StartElement) (err error) {
	var out []byte;
	{
		var u User;

		if err = d.DecodeElement(&u, &start); err != nil {
			err = errors.Wrap(err, "cant't decode <wp:user>");
			return;
		}

		// http://jekyllrb.com/docs/datafiles/#example-accessing-a-specific-author
		// https://github.com/jekyll/jekyll-feed#author-information
		// https://github.com/jekyll/jekyll-feed/blob/v0.9.2/lib/jekyll-feed/feed.xml#L44-L48
		// https://github.com/jekyll/jekyll-feed/blob/v0.9.2/lib/jekyll-feed/feed.xml#L45
		out = []byte(
			u.Login+": "                                    +"\n"+  //FIXME: not safe! ...
			"  name: "                + u.DisplayName       +"\n"+  //FIXME: not safe! ...
			"  gravatar_email_hash: " + u.GravatarEmailHash +"\n"+
			"  gravatar_server_rnd: " + u.GravatarServerRnd +"\n");

	}

	// if you create multiple goroutines you can get race condition
	// (one file, multiple writers - goroutines, io.ErrShortWrite)
	//>>> decodersGroup.Add(1);
	//>>> go func(){ defer decodersGroup.Done();
	// Solution: - create one goroutine (file writer) and send jobs to it by channel ("chan <- job")
	//           - just write to file:
	if err := WriteTo(peopleDataFile, out); err != nil {
		log.Panic(err);
	}
	//>>> }();

	return;
}

var contentFilter = func() func(string) string {
	//TODO[by hand]: check content for "{{" "}}" "{%" "%}" - https://github.com/Shopify/liquid/wiki/Liquid-for-Designers

	// Correct "more" code (excerpt separator)
	// =======================================
	// Before: <!--more Читать далее -->
	// After:  <!--more-->
	// ! don't use `<!--more.+?-->`, example "<!--more--><br> <!--abc-->"
	var moreCode = regexp.MustCompile(`<!--more.*?-->`);

	// Replace hardcoded 9b.asoiu.com URI's to ...
	// ===========================================
	//site.github.url :
	//  http://jekyllrb.com/docs/github-pages/#project-page-url-structure
	//  https://help.github.com/articles/repository-metadata-on-github-pages/
	//  https://github.com/jekyll/github-metadata#what-it-does
	//is broken:
	//  https://github.com/jekyll/github-metadata/issues/47#issuecomment-253870915
	//  https://stackoverflow.com/questions/38133562/cant-preview-github-pages  site.github.url == site.url + site.baseurl
	//  https://github.com/github/pages-gem/issues/350#issuecomment-319222176   site.url + site.baseurl == absolute_url
	//  and http://ben.balter.com/jekyll-style-guide/config/#url
	//  and https://github.com/jekyll/jekyll/issues/5070  ( history in #issuecomment-231502898 comment )
	//HTTP(S):
	//  https://github.com/github/pages-gem/issues/238#issuecomment-206964532 ("/" and "//" useful for layouts*)
	//  Cloudflare (Automatic HTTPS Rewrites) (useful for content: post/page/comments):
	//    https://support.cloudflare.com/hc/en-us/articles/227227647-How-do-I-use-Automatic-HTTPS-Rewrites-
	//    https://blog.cloudflare.com/fixing-the-mixed-content-problem-with-automatic-https-rewrites/
	//
	// Replace to {{ "<path>" | absolute_url }}  http://jekyllrb.com/docs/templates/#filters
	// -------------------------------------------------------------------------------------
	//general regexp:
	// `[^'"]\s*http://9b\.asoiu\.com(?P<path>[^\s<]*)`   for `>http://9b.asoiu.com/...<`
	// `(['"])\s*http://9b\.asoiu\.com(?P<path>[^>]*?)$1` for `"http://9b.asoiu.com/..."` or `'http://9b.asoiu.com/...'`
	// NOTE: Go not support `$1` inside regexp
	//specific simple regexp (valid only for my data):
	// `(?P<before>['>"])http://9b\.asoiu\.com(?P<path>[^"<']*)`
	// usage: re.ReplaceAllString(p.Content, `${before}{{ "${path}" | absolute_url }}`)
	//... but I like to use post_url and link Liquid tag for "link validation" http://jekyllrb.com/docs/templates/#links
	//
	// Replace to {{ site.url }}{{ site.baseurl }}<path>
	// -------------------------------------------------
	var hardcodedUri = strings.NewReplacer("http://9b.asoiu.com", "{{ site.url }}{{ site.baseurl }}");
	// see also: Golang NewReplacer src (makeSingleStringReplacer, makeGenericReplacer) and/vs Python "FlashText" lib:
	//           - https://habrahabr.ru/post/343116/#comment_10551928
	//           - https://habrahabr.ru/post/343116/#comment_10552196
	//           - https://golang.org/pkg/regexp/#pkg-overview
	//           - https://swtch.com/~rsc/regexp/regexp1.html

	// Wrap "/wp-content/*" and "/wp-includes/*" URI to Liquid "link" tag  http://jekyllrb.com/docs/templates/#links
	//{% link news/index.html %}
	var linkWrapper = regexp.MustCompile(`{{ site\.baseurl }}(?P<path>/wp-(content|includes)/[^"<']*)`);

	// New place for smiles :)
	var pathToSmiles = strings.NewReplacer("{% link /wp-includes/images/smilies/icon_", "{% link /theme/)/");

	/* Correct URI's in gallery shortcode (`class='gallery-item'`). Done in patch "post-template.php".
	 * ========================================================================================
	 *  /wp-includes/media.php:gallery_shortcode() > "$link" > /wp-includes/post-template.php:wp_get_attachment_link()
	 *  > $url, [$permalink] > [/wp-includes/link-template.php:get_attachment_link()] && /wp-includes/post.php:wp_get_attachment_url()
	 * ----------------------------------------------------------------------------------------
	 *  Before patch:
	 *  - `<a href='{{ site.url }}{{ site.baseurl }}/?attachment_id=1960'>`
	 *  - `<a href='{{ site.url }}{{ site.baseurl }}/post_path/file_name/'>`
	 *  - `<a href='{{ site.url }}{{ site.baseurl }}/post_path/attachment/file_name/'>`
	 *  After patch:
	 *  - `<a href='{{ site.url }}{{ site.baseurl }}{% link /wp-content/uploads/path_to_file %}'>`
	/*/

	// Correct links to post and wrap to Liquid "post_url" tag  http://jekyllrb.com/docs/templates/#linking-to-posts
	//NOTE: still need edit some links by hand, see postIdToName[]
	var linkToPost = RegexpBis{regexp.MustCompile(`{{ site\.baseurl }}/(\?p=(?P<id>\d+)|\d{4}/(?P<id2>\d+)/[^"<'\s]*)`)};
	var linkToPostFunc = func(src string, match []int) string {
		var group = 2; // group "id"
		if match[2*group] == match[2*group+1] { group = 3; } // group "id2"

		var startPos = match[2*group]   - match[0];
		var endPos   = match[2*group+1] - match[0];

		if id, err := strconv.Atoi(src[startPos:endPos]); err == nil {
			if postName, ok := postIdToName[id]; ok {
				return "{{ site.baseurl }}{% post_url " + postName + " %}";
			}
		}

		return src; // can't replace, but it's ok
	};

	return func(content string) string {
		content = moreCode.ReplaceAllLiteralString(content, "<!--more-->");
		content = hardcodedUri.Replace(content);
		content = linkWrapper.ReplaceAllString(content, "{{ site.baseurl }}{% link ${path} %}");
		content = pathToSmiles.Replace(content);
		content = linkToPost.ReplaceAllStringSubmatchIndexFunc(content, linkToPostFunc);
		return content;
	};
}();


var postIdToName map[int]string;

func (*ItemDecoder) UnmarshalXML(d *xml.Decoder, start xml.StartElement) (err error) {
	var (
		dirName, filePrefix, unescapedWpPostSlug string
		out []byte
		lastEditDateGmt time.Time
	);{
		var p Post;

		if err = d.DecodeElement(&p, &start); err != nil {
			err = errors.Wrap(err, "cant't decode <item>");
			return;
		}

		//== {Type x Status} decision matrix === In particular: set dirName, filePrefix value ========================//
		{
			type filePath   func() (dirName, filePrefix string);
			type itemStatus struct{
				draft   filePath
				pending filePath
				publish filePath
				private filePath
			};
			type itemType   struct{
				page itemStatus
				post itemStatus
			};

			var filePrefixEnd = "";

			var it = itemType{
				page: itemStatus{
					draft:   func()(dn,fp string){return "pages/_drafts",         "" },
					pending: func()(dn,fp string){return "pages/_drafts/pending", "" },
					publish: func()(dn,fp string){return "pages",                 "" },
					private: func()(dn,fp string){return "private/pages",         "" }, //TODO[x]: add "private" folder to ".gitignore"
				},
				post: itemStatus{
					draft:   func()(dn,fp string){return "_drafts",                                                   filePrefixEnd },
					pending: func()(dn,fp string){return "_drafts",        p.LastEditDateGmt.Format("2006-01-02")+"-"+filePrefixEnd },
					publish: func()(dn,fp string){return "_posts",         p.PublishDateGmt .Format("2006-01-02")+"-"+filePrefixEnd },
					private: func()(dn,fp string){return "private/_posts", p.PublishDateGmt .Format("2006-01-02")+"-"+filePrefixEnd },
				},
			};

			var is *itemStatus;
			switch p.Type {
			case "attachment": return;
			case "page":       is = &it.page;
			case "post":       is = &it.post; filePrefixEnd = strconv.Itoa(p.Id)+"-";
			default:
				err = errors.Wrap(err, "cant't recognize <item> type "+strconv.Quote(p.Type)+", inspect your data!");
				return;
			}

			switch p.Status {
			case "draft":   dirName,filePrefix = is.draft();
			case "pending": dirName,filePrefix = is.pending(); p.PublishDateGmt = p.LastEditDateGmt;
			case "publish": dirName,filePrefix = is.publish();
			case "private": dirName,filePrefix = is.private();
			default:
				err = errors.Wrap(err, "cant't recognize <item> status "+strconv.Quote(p.Status)+", inspect your data!");
				return;
			}

			//alternative to https://www.fluentcpp.com/2017/06/27/how-to-collapse-nested-switch-statements/
		}//=======================================================================================================//

		if unescapedWpPostSlug, err = url.QueryUnescape(p.Slug); err != nil { //prefer url.PathUnescape()
			err = errors.Wrap(err, "cant't unescape post slug");
			return;
		}

		if p.Type == "post" {
			postIdToName[p.Id] = filePrefix + unescapedWpPostSlug;
		}

		lastEditDateGmt = p.LastEditDateGmt.Time;


		//== Make "Out" ==============================================================================================//
		{
			const dateFormat = "2006-01-02 15:04:05 -0700";

			out = []byte(
				"---"                                                           +"\n"+
				"layout: " +                     p.Type                         +"\n"+
				"wp_id:  " +        strconv.Itoa(p.Id)                          +"\n"+
				"title:  " + "'"+strings.Replace(p.Title, "'", "&#39;", -1)+"'" +"\n"+
				"author: " +                     p.UserLogin                    +"\n");

			var aLn = func(par string){
				out = append(out, par...);
				out = append(out, '\n');
			};
			var oLn = func(par string, val string){
				out = append(out, par...);
				out = append(out, val...);
				out = append(out, '\n');
			};


			if !p.PublishDateGmt.IsZero() {  oLn("date:             ", p.PublishDateGmt .Format(dateFormat));  }
			                               //oLn("wp_last_edit_date: ", p.LastEditDateGmt.Format(dateFormat));
			                               //see real "last_edit_date" in commit history
			                               //renamed for https://github.com/jekyll/jekyll-sitemap#lastmod-tag
			                                 oLn("last_modified_at: ", p.LastEditDateGmt.Format(dateFormat));


			if p.Type == "post" {
				var wpId = strconv.Itoa(p.Id);
				aLn("redirect_from: ");
				oLn("  - ", "/excerpt/"+wpId+".html");

				if p.Status == "publish" {
					var year_wpId = "/"+strconv.Itoa(p.PublishDateGmt.Year())+"/"+wpId+"/";
					oLn("  - ", year_wpId);
					oLn("  - ", year_wpId+unescapedWpPostSlug+"/");
				}
			} else { // p.Type == "page"
				oLn("permalink: ", "/"+unescapedWpPostSlug+"/");
			}


			//== Collections =========================================================================================//
			{
				var collections = map[string] []string {};
				for _,category := range p.Categories {
					//it must be simple as "collections[collectionFor[category]] += category" but ...
					var collectionName = collectionFor[category];
					if  collectionName == "" { collectionName = "wp_wrong_noname_collection"; } // - author set top-level category (category haven't parent);
					                                                                            // - category doesn't exist (not in "rss>channel>category" list) (DB error?)
					                                                                            // - one of top-level categories have empty ("") name
					var collection     = collections[collectionName];

					// https://stackoverflow.com/questions/20195296/golang-append-an-item-to-a-slice/20195437#20195437
					if collectionMod := append(collection, category); (len(collection) == 0) || (&collectionMod[0] != &collection[0]) {
						//avoid 2nd search in map (collections[collectionName]) if collectionMod == collection
						//you can't simply do: var p=&collections[collectionFor[category]]; *p = append(*p, category); :
						// https://stackoverflow.com/a/32496031
						// https://groups.google.com/forum/#!msg/golang-nuts/6IaQ1H8ewMk/EiBYqqGngP4J
						collections[collectionName] = collectionMod;
					}
				}

				var printCollection = func(name string){
					if c, exist := collections[name]; exist {
						oLn(name, ": ");
						for i,_ := range c {
							oLn("  - ", c[i]); //FIXME: not safe! ...
						}
					}
				}

				printCollection("authors");
				printCollection("issues");
				printCollection("categories");

				delete(collections, "authors");
				delete(collections, "issues");
				delete(collections, "categories");

				for name, c := range collections {
					oLn(name, ": ");
					for i,_ := range c {
						oLn("  - ", c[i]); //FIXME: not safe! ...
					}
				}
			}//===================================================================================================//


			//== Tags ================================================================================================//
			{
				aLn("tags: ");
				for i,_ := range p.Tags {
					oLn("  - ", p.Tags[i]); //FIXME: not safe!
					                        // Can contain " #"
					                        // or starts with <reserved symbols>
					                        // https://en.wikipedia.org/wiki/YAML#Syntax
				}
			}//===================================================================================================//


			//== Comments ============================================================================================//
			if len(p.Comments) != 0 {
				aLn("wp_comments: ");
				// need sort
				// fmt.Println("  # sorted: by date_gmt ", sort.IsSorted(CommentsByDateGmt{p.Comments}),
				//                       ", by id ",       sort.IsSorted(CommentsById     {p.Comments}));
				sort.Sort(CommentsByDateGmt{p.Comments});
				// fmt.Println("  # sort by date_gmt -> sorted by id: ", sort.IsSorted(CommentsById{p.Comments})); // Yes (for my data)

				for _,c := range p.Comments {
					aLn("  - ");
					oLn("    id:     ",   strconv.Itoa(c.Id));
					oLn("    date:   ",   c.DateGmt.Format(dateFormat));
				//	oLn("    approved: ", c.Approved == 1);
					oLn("    author: ",   c.UserLogin);
					aLn("    content: | ");
					oLn("             ",  strings.Replace(strings.TrimSpace(contentFilter(c.Content)), "\n", "\n"+
					    "             ", -1));
				}
			}//===========================================================================//


			aLn("---");


			aLn(contentFilter(p.Content));
		}
	}

	MustWriteFileAsync(&decodersGroup, exportDir+"/"+dirName, filePrefix+unescapedWpPostSlug+".html", lastEditDateGmt, out);

	return;
}

const exportDir = "export";
var   decodersGroup sync.WaitGroup;

func main() {
	var xmlWP, err = os.Open("wordpress.2017-12-17.lite.xml");
	if err != nil {
		log.Panicln("Error opening file:", err);
	}
	defer xmlWP.Close();

	peopleDataFile, err = CreateFile(exportDir+"/"+"_data", "authors.yml");
	if err != nil {
		log.Panicln("Can't create Authors DataBase file:", err);
	}
	defer func(){
		if err := peopleDataFile.Close(); err != nil {
			log.Println(err);
		}
	}();

	collectionFor = make(map[string]string);
	collections   = make(map[string]string);

	postIdToName = make(map[int]string);

	var rss Rss;
	if err = xml.NewDecoder(xmlWP).Decode(&rss); err != nil { // goto "UnmarshalXML()"'s ->
		log.Panicln("Can't decode <rss>: ", err);
	}
	decodersGroup.Wait();

	//fmt.Println(collections);
	//for key, val := range collectionFor {
	//	fmt.Println(val, "\t<-", key);
	//}


	return;

	/*
	//      - внутри него делать (выводить на экран, записывать на диск) не сохраняя в памяти, и убедиться, что созданный тип ничего не занимает в памяти
	//      - искать rss>channel>item
	//альтернатива: добавить ".Skip()", и switch, который бы пропускал все, кроме rss, channel и item
	var total = 0;
	for{
		var t xml.Token;

		t, err = decoder.Token();
		if err != nil { break; }

		if se, ok := t.(xml.StartElement); ok {
			fmt.Println(se.Name.Local);
			if se.Name.Local == "item" {
				var p Post;

				if err = decoder.DecodeElement(&p, &se); err != nil { break; }

				fmt.Println(p);

				total++;
			}
		}
	}

	if err != io.EOF {
		fmt.Println(err);
	}

	fmt.Printf("Total posts: %d \n", total);
	*/
}

//func memoryFootprintSizeTest() {
	// Go v1.7

	// func (i *Item) Yoo(){ fmt.Print(""); }

	//:: min footprint (constant)
	//type Item struct{};
	//
	// for _, p := range make([]Item, 102400000) { p.Yoo(); }
	//  == equivalent to ==
	// var mem = make([]Item, 102400000);
	// for i, _ := range make([]Item, 102400000) { mem[i].Yoo(); }

	//:: big footprint (increasing in time)
	//type Item struct{ a int };
	//
	// for _, p := range make([]Item, 102400000) { p.Yoo(); }
	//  :: less "page faults" and "working set" ::
	// var mem = make([]Item, 102400000);
	// for i, _ := range make([]Item, 102400000) { mem[i].Yoo(); }

	//See also:
	// - Padding is hard (Go v1.4, v1.5): https://dave.cheney.net/2015/10/09/padding-is-hard
	// - The empty struct: https://dave.cheney.net/2014/03/25/the-empty-struct
//}
