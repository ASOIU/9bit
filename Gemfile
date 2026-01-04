source 'https://rubygems.org'

require 'json'
require 'open-uri'
require 'net/http'
versions = JSON.parse(Net::HTTP.get(::URI.parse('https://pages.github.com/versions.json')))

# http://jekyllrb.com/docs/github-pages/#deploying-jekyll-to-github-pages
# https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/#step-2-install-jekyll-using-bundler
# https://github.com/github/pages-gem/issues/351#issuecomment-259445262
# https://pages.github.com/versions/
# https://github.com/github/pages-gem
gem 'github-pages', versions['github-pages'], group: :jekyll_plugins
gem 'jekyll-include-cache', group: :jekyll_plugins

# "group: :jekyll_plugins" and "/assets/javascript/anchor-js" "/assets//css/style.css":
# https://github.com/jekyll/jekyll/issues/6358 ->
# -> https://github.com/github/pages-gem/issues/482#issuecomment-328985983 ->
# -> https://github.com/jekyll/jekyll/issues/6361#issuecomment-335147959
