package main

import (
	"regexp"
	"unicode/utf8"
)


type RegexpBis struct { *regexp.Regexp }

// For Pull request https://github.com/golang/go/pull/14281#issuecomment-182148274
//                  https://github.com/golang/go/issues/18517
//func (re *RegexpBis) ReplaceAllStringSubmatchIndexFunc(src string, repl func(string, []int) string) string {
//	// https://golang.org/src/regexp/regexp.go?s=15837:15920#L493
//	// https://golang.org/src/regexp/regexp.go?s=28617:28672#L934
//
//  n := re.prog.NumCap; //or "2 * (re.numSubexp + 1)" - ReplaceAllString()
//	b := re.replaceAll(nil, src, n, func(dst []byte, match []int) []byte {
//		return append(dst, repl(match)...);
//	});
//
//	return string(b);
//}
func (re *RegexpBis) ReplaceAllStringSubmatchIndexFunc(src string, repl func(string, []int) string) string {
	// replaceAll() from https://raw.githubusercontent.com/golang/go/release-branch.go1.9/src/regexp/regexp.go
	var buf []byte;

	var endPos = len(src);

	var lastMatchEnd = 0;
	var searchPos    = 0;

	for searchPos <= endPos {
		var a = re.FindStringSubmatchIndex(src[searchPos:]);
		if len(a) == 0 { break; }

		buf = append(buf, src[lastMatchEnd:searchPos+a[0]]...);

		if searchPos+a[1] > lastMatchEnd || searchPos+a[0] == 0 {
			buf = append(buf, repl(src[searchPos+a[0]:searchPos+a[1]], a)...); // use "-a[0]" as offset in repl
		}
		lastMatchEnd = searchPos+a[1];


		var width int;
		_, width = utf8.DecodeRuneInString(src[searchPos:]);

		switch {
		case a[1] < width: searchPos += width; // width == 0 ?
		case a[1] < 1:     searchPos ++;       // a[1]  == 0,-1
		default:           searchPos += a[1];
		}
	}

	buf = append(buf, src[lastMatchEnd:]...);

	return string(buf);
}