Девятый бит
===========
<p align="center" style="text-align:center"><img src="https://user-images.githubusercontent.com/6351274/34527970-a5b667a6-f0a7-11e7-92fe-5065a982cf58.png" alt="'Девятый бит' mockup"></p>

Архив блога кафедры АСОИУ ОмГТУ, сконвертированный из WordPress в Jekyll.

**Live URL:** https://9b.asoiu.com

Includes / Включает в себя
--------------------------
- **WordPress XML → Jekyll exporter**  
  {Golang; placed in [`xmlWP2Jekyll`](https://github.com/ASOIU/9bit/tree/xmlwp2jekyll) branch; include patch for WordPress}

  > Экспортер из WordPress XML в Jekyll  
  > {написан на Go; находится в ветке [`xmlWP2Jekyll`](https://github.com/ASOIU/9bit/tree/xmlwp2jekyll), там же лежит WordPress XML из которого был сгенерирован этот блог, и патчи для WordPress, позволяющие получить все нужные данные}

- WordPress-like size/cache-friendly dynamic **taxonomy pages** (_category_, _tag_, _author_, _issue_, …)  
  {[source code](https://github.com/ASOIU/9bit/blob/master/_layouts/taxonomy.html), [example](https://9b.asoiu.com/taxonomy/#/tag/сисадмин/)}

  > Полноценную таксономию "как в WordPress" для _рубрик_, _тегов_, _авторов_ и _выпусков_  
  > (в Jekyll обычно ограничиваются [более простым вариантом](https://github.com/jekyll/jekyll-feed/issues/70#issuecomment-159442173))  
  > {[исходники](https://github.com/ASOIU/9bit/blob/master/_layouts/taxonomy.html), [пример](https://9b.asoiu.com/taxonomy/#/category/голова-лом/)}

- Inline **comments** {[source code](https://github.com/ASOIU/9bit/blob/master/_layouts/post.html#L100-L134), [YAML Front Matter example](https://github.com/ASOIU/9bit/blob/master/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L33-L39), [result](https://9b.asoiu.com/2016/3704-ringsync-синхронизируем-на-полной-скорости-с/#comments)}

  > Комментарии: прежние комментарии генерируются вместе с остальным содержимым страниц постов
  > {[исходники](https://github.com/ASOIU/9bit/blob/master/_layouts/post.html#L100-L134), [пример YAML Front Matter](https://github.com/ASOIU/9bit/blob/master/_posts/2010-03-01-1379-hacked-by-behemoth.html#L24-L30), [результат](https://9b.asoiu.com/2016/1379-hacked-by-behemoth/#comments)}

- **Search** {[source code](https://github.com/ASOIU/9bit/blob/master/_layouts/default.html#L146-L159)}

  > Просто поиск по блогу, как в [этой картинке](http://www.commitstrip.com/en/2015/11/26/search-engines/) {[исходники](https://github.com/ASOIU/9bit/blob/master/_layouts/default.html#L146-L159)}

- More-**cut visualizer** {[source code](https://github.com/ASOIU/9bit/blob/master/_layouts/default.html#L81), [example](https://9b.asoiu.com/2016/3704-ringsync-синхронизируем-на-полной-скорости-с/#more)}

  > Место "_разрыва страницы_": при открытии полной версии поста через кнопку "Читать далее" - сразу же будет видно, где находится продолжение  
  > (полезно, когда открываешь сразу несколько/много постов в фоновых вкладках; при открытии вкладки сразу виден текст "_до ката_" - можно вспомнить, почему открыл этот пост, и видно место продолжение чтения)  
  > {[исходники](https://github.com/ASOIU/9bit/blob/master/_layouts/default.html#L81); для примера можно на [главной странице](https://9b.asoiu.com) открыть (в текущей вкладке) первый пост, чтобы посмотреть на эффект "_разрыва страницы_"}

- **Redirects** from WordPress URIs:  
  - `/?p=<id>` {["include" place](https://github.com/ASOIU/9bit/blob/master/_layouts/default.html#L85-L89), [source code](https://github.com/ASOIU/9bit/blob/master/_includes/p_query_handler.html) + [YAML Front Matter example](https://github.com/ASOIU/9bit/blob/master/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L9)};  
  - `/<year>/<id>/<slug>/`, `/<year>/<id>/<slug>/<something>`, `/<year>/<id>/<something>`, `/<year>/<id>`  
    {[source code](https://github.com/ASOIU/9bit/blob/master/404.html) + [YAML Front Matter example](https://github.com/ASOIU/9bit/blob/master/_posts/2016-09-20-3704-ringsync-синхронизируем-на-полной-скорости-с.html#L10-L11)}

  > Альтернативные ссылки: большинство прежних ссылок (из WordPress) на основное содержимое блога (посты) будут продолжать работать  
  > (не работают только ссылки на страницы категорий `/?cat=<id>`, тегов `/?tag=<slug>`, страниц `/?page_id=<id>`)

- **`throw Error` on _Liquid_** (used in some checks) {[source code](https://github.com/ASOIU/9bit/blob/master/_includes/post_metadata.html#L38)}

  > Контроль целостности/консистентности данных: если она будет нарушена - сборка сайта прекратится  
  > {[пример в исходниках](https://github.com/ASOIU/9bit/blob/master/_includes/post_metadata.html#L38)}  
  > (см. также эти _Issues_: [проверка целостности ссылок в комментариях к постам](https://github.com/jekyll/jekyll/issues/6414), [при использовании jekyll-redirect-from, permalink, … возможны коллизии](https://github.com/jekyll/jekyll-redirect-from/issues/164) {[решение проблемы в исходниках](https://github.com/ASOIU/9bit/blob/master/_layouts/post.html#L13-L19)})

- Fast **SVG animated shadows** for raster pics (_Ambient Occlusion Shadow_)  
  {[source code](https://github.com/ASOIU/9bit/blob/master/theme/support-us/support-us.svg?short_path=34e022e), [example (see bottom of the right sidebar)](https://9b.asoiu.com/#sidebar), [some performance tests](https://github.com/ASOIU/9bit/tree/master/theme/support-us/SVG) (see `don*.svg` files)}

  > Эффект поднятия/парения объекта над плоскостью при наведении курсора  
  > {[исходники](https://github.com/ASOIU/9bit/blob/master/theme/support-us/support-us.svg?short_path=34e022e), [пример на странице (последний блок в правой колонке)](https://9b.asoiu.com/#sidebar), [примерно в такой последовательности увеличивалась производительность](https://github.com/ASOIU/9bit/tree/master/theme/support-us/SVG) (см. файлы `don*.svg`),  
  > [_сердце блендера_](https://9b.asoiu.com/theme/support-us/SVG/don2.2.svg) ([Blender](https://www.blender.org); для запуска сердца - нужно навести курсор на него)}

- **Tag-cloud on _Liquid_** {[source code](https://github.com/ASOIU/9bit/blob/master/_includes/widget_tag_cloud.html), [SQRT on _Liquid_](https://github.com/ASOIU/9bit/blob/master/_includes/widget_tag_cloud.html#L61-L62)}

  > Простое облачко тегов (только вот аналогичный код на assembly выглядел бы проще, чем этот код на _Liquid_)  
  > {[исходники](https://github.com/ASOIU/9bit/blob/master/_includes/widget_tag_cloud.html) ← самое интересное здесь, и несколько [альтернативных версий](https://github.com/ASOIU/9bit/tree/master/_includes) в файлах `widget_tag_cloud_alt*.html`}

- WAI-ARIA compatible NoJS-friendly IE8+ **Crypto Coin** (Bitcoin) **donation button**+popover  
  {[source code](https://github.com/ASOIU/9bit/tree/master/theme/crypto-currency), [example](https://9b.asoiu.com/theme/crypto-currency/example.html)}

  > Просто кнопочка для _поддержки_, заменила предыдущую/старую кнопку "[Coinwidget Shortcode WP plugin](https://wordpress.org/plugins/coinwidget-shortcode/)"


- HTML5, WAI-ARIA 1.0, Schema.org+Microdata, Microformats (rel)
  ///
  _Доступная_ ( достаточно нажать <kbd>Ctrl+U</kbd> :), _семантическая_ разметка
- Compatible with All Modern Desktop Browsers
- Page load sequences optimization
  ///
  Оптимизация трасс загрузки страницы
- Easter egg
  ///
  Пасхалки

Usage / Использование
---------------------
```bash
git clone https://github.com/ASOIU/9bit.git
cd 9bit
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000 in your browser.
