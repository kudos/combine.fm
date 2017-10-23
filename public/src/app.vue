<template>
  <div id="app">
    <div class="header" v-bind:class="{ 'share': $store.state.share }">
      <div class="container">
        <h1 class="title">
          <router-link to="/" exact>
            <img src="/assets/images/logo-128.png"> <b>combine</b><span class="lighter">.fm</span>
          </router-link>
        </h1>
      </div>
    </div>
    <div>
      <router-view></router-view>
    </div>
    <div class="footer-break">
    </div>
    <footer class="footer">
      <div class="container has-text-right">
        <a href='https://twitter.com/MatchAudio'>Tweet</a> or <a href='https://gitlab.com/kudos/match.audio'>Fork</a>. A work in progress by <a href='http://crem.in'>this guy</a>.
      </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Comfortaa');
html {
  position: relative;
  min-height: 100%;
}
body {
  color: #445470;
  background: #fff;
  margin: 0 0 160px;
}
.header {
  font-family: 'Comfortaa', cursive;
  background: #FE4365;
}
.header img {
  height: 64px;
}
h1 {
  text-align: left;
  padding: 10px 0;
}
h1 a {
  color: #fff;
}
h1 a:hover {
  color: #ffacc5;
}
.share {
  margin-bottom: 40px;
}
.share h1 {
  text-align: left;
  font-size: 1.5em;
  line-height: 36px;
  padding: 5px 0;
}
.share h1 img {
  height: 40px;
}
.title a:hover {
  border-bottom: none;
}
h1 .lighter {
  color: #ffacc5;
}
.footer-break {
  height: 1px;
}
.footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 40px 24px 40px 24px;
}
</style>
