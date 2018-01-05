Девятый бит
===========
<p align="center" style="text-align:center"><img src="https://user-images.githubusercontent.com/6351274/34527970-a5b667a6-f0a7-11e7-92fe-5065a982cf58.png" alt="'Девятый бит' mockup"></p>

Обычный WordPress блог, ничего особого в нем нет ;)
[Подробнее…](#TODO:вставить-ссылку-на-заметку-в-google+)

Includes / Включает в себя
--------------------------
- :small_orange_diamond: **WordPress XML → Jekyll exporter**  
  {Golang; placed in [`xmlWP2Jekyll`](https://github.com/ASOIU/9bit/tree/xmlwp2jekyll) branch; include patch for WordPress}

  :small_blue_diamond: Экспортер из WordPress XML в Jekyll  
  {написан на Go; находится в ветке [`xmlWP2Jekyll`](https://github.com/ASOIU/9bit/tree/xmlwp2jekyll), там же лежит WordPress XML из которого был сгенерирован этот блог, и патчи для WordPress, позволяющие получить все нужные данные}

- :small_orange_diamond: WordPress-like size/cache-friendly dynamic **taxonomy pages** (_category_, _tag_, _author_, _issue_, …)  
  {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/taxonomy.html), [example](http://9b.asoiu.com/taxonomy/#/tag/сисадмин/)}

  :small_blue_diamond: Полноценную таксономию "как в WordPress" для _рубрик_, _тегов_, _авторов_ и _выпусков_  
  (в Jekyll обычно ограничиваются [более простым вариантом](https://github.com/jekyll/jekyll-feed/issues/70#issuecomment-159442173))  
  {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/taxonomy.html), [пример](http://9b.asoiu.com/taxonomy/#/category/голова-лом/)}

- :small_orange_diamond: Inline **comments** {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/post.html#L100-L134), [YAML Front Matter example](https://github.com/ASOIU/9bit/blob/black-triangle/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L33-L39), [result](http://9b.asoiu.com/2016/3704-ringsync-синхронизируем-на-полной-скорости-с/#comments)}  
  and  
  Google+ (Blogger) comment system  
  {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/theme/comments.plus.js), ["include script" place](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L70-L76), [YAML Front Matter config example](https://github.com/ASOIU/9bit/blob/black-triangle/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L32), place on [HTTPS](https://9b.asoiu.com/2016/3704-ringsync-синхронизируем-на-полной-скорости-с/#comments-plus) page}

  :small_blue_diamond: Комментарии: прежние комментарии генерируются вместе с остальным содержимым страниц постов  
  {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/post.html#L100-L134), [пример YAML Front Matter](https://github.com/ASOIU/9bit/blob/black-triangle/_posts/2010-03-01-1379-hacked-by-behemoth.html#L24-L30), [результат](http://9b.asoiu.com/2016/1379-hacked-by-behemoth/#comments)},  
  а для новых комментариев - Google+ iframe  
  {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/theme/comments.plus.js), [место подключения скрипта](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L70-L76), [пример переопределения канонической ссылки на страницу через YAML Front Matter](https://github.com/ASOIU/9bit/blob/black-triangle/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L32), местоположение на странице при открытии через [HTTPS](https://9b.asoiu.com/2016/3704-ringsync-синхронизируем-на-полной-скорости-с/#comments-plus)}

- :small_orange_diamond: **Search** {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L146-L159)}

  :small_blue_diamond: Просто поиск по блогу, как в [этой картинке](http://www.commitstrip.com/en/2015/11/26/search-engines/) {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L146-L159)}

- :small_orange_diamond: More-**cut visualizer** {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L81), [example](http://9b.asoiu.com/2016/3704-ringsync-синхронизируем-на-полной-скорости-с/#more)}

  :small_blue_diamond: Место "_разрыва страницы_": при открытии полной версии поста через кнопку "Читать далее" - сразу же будет видно, где находится продолжение  
  (полезно, когда открываешь сразу несколько/много постов в фоновых вкладках; при открытии вкладки сразу виден текст "_до ката_" - можно вспомнить, почему открыл этот пост, и видно место продолжение чтения)  
  {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L81); для примера можно на [главной странице](http://9b.asoiu.com) открыть (в текущей вкладке) первый пост, чтобы посмотреть на эффект "_разрыва страницы_"}

- :small_orange_diamond: **Redirects** from WordPress URIs:  
  - `/?p=<id>` {["include" place](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/default.html#L85-L89), [source code](https://github.com/ASOIU/9bit/blob/black-triangle/_includes/p_query_handler.html) + [YAML Front Matter example](https://github.com/ASOIU/9bit/blob/black-triangle/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L9)};  
  - `/<year>/<id>/<slug>/`, `/<year>/<id>/<slug>/<something>`, `/<year>/<id>/<something>`, `/<year>/<id>`  
    {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/404.html) + [YAML Front Matter example](https://github.com/ASOIU/9bit/blob/black-triangle/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L10-L11)}

  :small_blue_diamond: Альтернативные ссылки: большинство прежних ссылок (из WordPress) на основное содержимое блога (посты) будут продолжать работать  
  (не работают только ссылки на страницы категорий `/?cat=<id>`, тегов `/?tag=<slug>`, страниц `/?page_id=<id>`)

- :small_orange_diamond: **`throw Error` on _Liquid_** (used in some checks) {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/_includes/post_metadata.html#L38)}

  :small_blue_diamond: Контроль целостности/консистентности данных: если она будет нарушена - сборка сайта прекратится  
  {[пример в исходниках](https://github.com/ASOIU/9bit/blob/black-triangle/_includes/post_metadata.html#L38)}  
  (см. также эти _Issues_: [проверка целостности ссылок в комментариях к постам](https://github.com/jekyll/jekyll/issues/6414), [при использовании jekyll-redirect-from, permalink, … возможны коллизии](https://github.com/jekyll/jekyll-redirect-from/issues/164) {[решение проблемы в исходниках](https://github.com/ASOIU/9bit/blob/black-triangle/_layouts/post.html#L13-L19)})

- :small_orange_diamond: Fast **SVG animated shadows** for raster pics (_Ambient Occlusion Shadow_)  
  {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/theme/support-us/support-us.svg?short_path=34e022e), [example (see bottom of the right sidebar)](http://9b.asoiu.com/#sidebar), [some performance tests](https://github.com/ASOIU/9bit/tree/black-triangle/theme/support-us/SVG) (see `don*.svg` files)}

  :small_blue_diamond: Эффект поднятия/парения объекта над плоскостью при наведении курсора  
  {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/theme/support-us/support-us.svg?short_path=34e022e), [пример на странице (последний блок в правой колонке)](http://9b.asoiu.com/#sidebar), [примерно в такой последовательности увеличивалась производительность](https://github.com/ASOIU/9bit/tree/black-triangle/theme/support-us/SVG) (см. файлы `don*.svg`),  
  [_сердце блендера_](http://9b.asoiu.com/theme/support-us/SVG/don2.2.svg) ([Blender](https://www.blender.org); для запуска сердца - нужно навести курсор на него)}

- :small_orange_diamond: **Tag-cloud on _Liquid_** {[source code](https://github.com/ASOIU/9bit/blob/black-triangle/_includes/widget_tag_cloud.html), [SQRT on _Liquid_](https://github.com/ASOIU/9bit/blob/black-triangle/_includes/widget_tag_cloud.html#L61-L62)}

  :small_blue_diamond: Простое облачко тегов (только вот аналогичный код на assembly выглядел бы проще, чем этот код на _Liquid_)  
  {[исходники](https://github.com/ASOIU/9bit/blob/black-triangle/_includes/widget_tag_cloud.html) ← самое интересное здесь, и несколько [альтернативных версий](https://github.com/ASOIU/9bit/tree/black-triangle/_includes) в файлах `widget_tag_cloud_alt*.html`}

- :small_orange_diamond: WAI-ARIA compatible NoJS-friendly IE8+ **Crypto Coin** (Bitcoin) **donation button**+popover  
  {[source code](https://github.com/ASOIU/9bit/tree/black-triangle/theme/crypto-currency), [example](http://9b.asoiu.com/theme/crypto-currency/example.html)}

  :small_blue_diamond: Просто кнопочка для _поддержки_, заменила предыдущую/старую кнопку "[Coinwidget Shortcode WP plugin](https://wordpress.org/plugins/coinwidget-shortcode/)"


- HTML5, WAI-ARIA 1.0, Schema.org+Microdata, Microformats (rel)
  ///
  _Доступная_ ( достаточно нажать <kbd>Ctrl+U</kbd> :), _семантическая_ разметка
- Compatible with All Modern Desktop Browsers ( i.e. IE9+ ;)
  ///
  Полностью совместим с :o2:pera Presto :)
- Page load sequences optimization
  ///
  Оптимизация трасс загрузки страницы
- Easter egg
  ///
  Пасхалки

Usage for own blog / Загрузка темы для адаптации под свой блог
--------------------------------------------------------------
1. :small_orange_diamond: **[Install](https://github.com/git-lfs/git-lfs/releases/latest)** [Git Large File Storage (LFS)](https://git-lfs.github.com)

   :small_blue_diamond: ~~Для хранения загруженных пользователями файлов `/wp-content/uploads/*` и некоторых больших картинок темы~~[<sup>1</sup>](#1) - используется [Git LFS](https://habrahabr.ru/post/255413/), поэтому **[устанавливаем](https://github.com/git-lfs/git-lfs/releases/latest)** [его](https://packagecloud.io/github/git-lfs/install#manual)
1. :small_orange_diamond: See [this](https://stackoverflow.com/questions/20280726/how-to-git-clone-a-specific-tag), [this](https://stackoverflow.com/questions/791959/download-a-specific-tag-with-git/792027#792027) ~~and [this LFS Tutorial](https://github.com/git-lfs/git-lfs/wiki/Tutorial#pulling-and-cloning)~~[<sup>1</sup>](#1) before run  
  `git clone -b tags/black-triangle --single-branch -- https://github.com/ASOIU/9bit.git`  
  ("[black-triangle](http://rampantgames.com/blog/?p=7745)" contain only main files + 3 posts for testing w/o user content)

   :small_blue_diamond: Чтобы не скачивать весь репозиторий (со всем пользовательским контентом "_Девятого бита_"), в репозитории есть коммит помеченный тегом `black-triangle` ([Чёрный треугольник](https://habrahabr.ru/post/339782/)), в котором из всего пользовательского контента оставлены только 3 поста (использовались для тестирования темы при ее создании), клонируем:  
  `git clone -b tags/black-triangle --single-branch -- https://github.com/ASOIU/9bit.git`  
  ~~(это может помочь увеличить скорость копирования: [LFS Tutorial](https://github.com/git-lfs/git-lfs/wiki/Tutorial#pulling-and-cloning), [`git lfs pull`](https://github.com/git-lfs/git-lfs/issues/325#issuecomment-149713215), [`GIT_LFS_SKIP_SMUDGE=1`](https://stackoverflow.com/questions/36376136/is-it-possible-for-git-lfs-pull-to-ignore-some-files-folders))~~[<sup>1</sup>](#1)
1. :small_orange_diamond: Be happy.

   :small_blue_diamond: Прочесть [заметку в Google+](#TODO:вставить-ссылку-на-заметку-в-google+) (если прежде ее не читали).

______
###### \[1\]: Git LFS :soon: GitHub Pages:

- [GitHub Pages won’t load files tracked using git-lfs](https://github.com/git-lfs/git-lfs/issues/791)
- [GitHub Pages serving the reference file instead of the actual binary](https://github.com/git-lfs/git-lfs/issues/1342)
