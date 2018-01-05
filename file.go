package main

import (
	"os"
	"io"
	"log"
	"time"
	"sync"
	"strconv"

	"github.com/pkg/errors"
)

func CreateFile(dirPath, fileName string) (f *os.File, err error) {
	const openFlags = os.O_WRONLY|os.O_CREATE|os.O_TRUNC;
	const perm = 666;

	//NOTE: fileName ("unescaped slug" from ItemDecoder) 'should' not contain any "BAD" filesystem character:
	//      - https://kb.acronis.com/content/39790
	//      - https://msdn.microsoft.com/en-us/library/aa365247.aspx
	//      - https://en.wikipedia.org/wiki/Filename#Comparison_of_filename_limitations
	//      - https://msdn.microsoft.com/en-us/library/windows/desktop/dd317748.aspx
	//      - https://stackoverflow.com/questions/35231846/golang-check-if-string-is-valid-path/35240286#35240286
	//     Regexp for test: regexp.MustCompile(`[\x{00}-\x{001F}\x{7F}\x{00A5}"*?/|\\:<>]`)
	//                   or regexp.MustCompile(`[\p{C}\x{00A5}"*?/|\\:<>]`)
	//                      - http://www.regular-expressions.info/unicode.html  "\p{C}"
	//                      - http://www.unicode.org/reports/tr18/#Basic_Unicode_Support
	//                      - test it:
	//                        - https://regex101.com
	//                        - https://regex-golang.appspot.com/assets/html/index.html
	//     If unescaped slug somehow contain the BAD character then:
	//     - re.ReplaceAllLiteralString(unescapedWpPostSlug, "-");
	//     - save (p.Id + "-" + <original "unescaped slug">) in YAML Front Matter "slug:" variable http://jekyllrb.com/docs/permalinks/#template-variables
	//NOTE: see also "filepath.Join(dir, filepath.FromSlash(path.Clean("/"+name)))"
	//      - https://golang.org/src/net/http/fs.go#L66  (Dir.Open())
	//      - https://golang.org/pkg/path/filepath/#Join
	//      - https://stackoverflow.com/questions/23285364/does-go-sanitize-urls-for-web-requests/23285643#23285643
	var filePath = dirPath + "/" + fileName;

	if f, err = os.OpenFile(filePath, openFlags, perm); err != nil {
		if os.IsNotExist(err) {
			if err = os.MkdirAll(dirPath, perm); err != nil { // prem == 666 ?
				err = errors.Wrap(err, "cant't create dir for file" + strconv.Quote(fileName));
				return;
			}

			f, err = os.OpenFile(filePath, openFlags, perm);
		}

		err = errors.Wrap(err, "cant't create file");
	}

	return;
}

func WriteTo(file *os.File, data []byte) (err error) {
	err = io.ErrShortWrite;

	for len(data) > 0 && err == io.ErrShortWrite { // if dst (storage) is full then CPU full (100%) too ;(
		var n int;
		n, err = file.Write(data);
		data = data[n:];
	}

	return;
}

func MustWriteFileAsync(wg *sync.WaitGroup, dirPath, fileName string, mtime time.Time, data []byte) {
	// https://stackoverflow.com/questions/19208725/example-for-sync-waitgroup-correct
	wg.Add(1);
	go func(){ defer wg.Done();
		var f, err = CreateFile(dirPath, fileName);
		if err != nil {
			log.Panic(err);
		}
		defer func() {
			// https://www.reddit.com/r/golang/comments/6gsjlf/dont_defer_close_on_writable_files/distjq7/
			if err := f.Close(); err != nil {
				log.Println(err);
			}
			// for posts in "_draft" folders http://jekyllrb.com/docs/drafts/
			//NOTE: git not save "mtime"!
			//      - https://www.quora.com/When-I-commit-code-on-git-does-the-modification-date-of-the-files-gets-commited-too
			//      - Why isn't Git preserving modification time on files?
			//        https://confluence.atlassian.com/bbkb/preserving-file-timestamps-with-git-and-mercurial-781386524.html
			//      - https://stackoverflow.com/a/13284229
			//      - https://stackoverflow.com/questions/2179722/checking-out-old-file-with-original-create-modified-timestamps/17583212#17583212
			if err := os.Chtimes(dirPath + "/" + fileName, time.Now(), mtime); err != nil {
				log.Println(err);
			}
		}();

		if err = WriteTo(f, data); err != nil {
			log.Panic(err);
		}
	}();
}