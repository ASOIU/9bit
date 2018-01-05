xmlWP2Jekyll: WordPress XML → Jekyll exporter
=============================================

The exporter is written in [Golang](https://golang.org).

The exported data are listed in [`main.go`](https://github.com/ASOIU/9bit/blob/bc5bd999d2311b54e952fd7ab0ad709cc6f5960c/main.go#L50-L109) (start from the bottom of the list first).  
Input XML file name is hardcoded [here](https://github.com/ASOIU/9bit/blob/bc5bd999d2311b54e952fd7ab0ad709cc6f5960c/main.go#L566).

Set of patches for WordPress:

 - `export.*.php`: `/wp-admin/includes/export.php`
 - `formatting.*.php`: `/wp-includes/formatting.php`
 - `post-template.*.php`: `/wp-includes/post-template.php`

`*.orig.php` - original WordPress v3.9.20 files.  
`*.patched.php` - patched files for v3.9.20 .

[Diff/Patch is here](https://github.com/ASOIU/9bit/commit/5c5b27aa7fe34dbe0f8ec0da2560fb90811084cb?diff=split).

`wordpress.2017-10-01.lite.export-test.xml` - little XML for testing.  
`wordpress.2017-12-17.lite.xml` - full "_Девятый бит_" XML.

Usage
-----
Fork _it_ **&&** Checkout branch of _it_ **&&** Rewrite _it_ **&&** Build/Run with `-ldflags "-w"` _it_.

Note for `-ldflags "-w"`:

- [Avoid debugging information on golang](https://stackoverflow.com/questions/30005878/avoid-debugging-information-on-golang)
- [What does the w flag mean when passed in via the ldflags option to the go command?](https://stackoverflow.com/questions/22267189/what-does-the-w-flag-mean-when-passed-in-via-the-ldflags-option-to-the-go-comman)
- [Облегчаем реверсинг Golang бинарников или зачем вообще писать скрипты в IDA](https://habrahabr.ru/post/325498) :)