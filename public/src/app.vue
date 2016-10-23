<template>
  <div id="app">
    <h1 class="title has-text-centered header"><router-link to="/" exact>
      match<span class="lighter">.audio</span>
    </router-link></h1>
    <div>
      <router-view></router-view>
    </div>
    <footer class="footer">
      <div class="container has-text-right">
        <a href='https://twitter.com/MatchAudio'>Tweet</a> or <a href='https://gitlab.com/kudos/match.audio'>Fork</a>. A work in progress by <a href='http://crem.in'>this guy</a>.
      </div>
    </footer>
  </div>
</template>

<style>
body {
  color: #445470;
  background: #fff;
}
h1 {
  background: #FE4365;
  padding: 25px 0;
}
h1 a {
  color: #fff;
}
h1 a:hover {
  color: #ffacc5;
}
.title a:hover {
  border-bottom: none;
}
h1 .lighter {
  color: #ffacc5;
}
.footer {
  margin-top: 50px;
  padding-bottom: 40px;
}
</style>
