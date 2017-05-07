"use strict";

window.loadPage = function loadPage(index) { // this function just for build, it is never used
  switch (index) {
    case 0:
      import("./pages/a").then(() => {
        console.info("a is ok now"); //eslint-disable-line
      });
      break;
    case 1:
      import("./pages/b").then(() => {
        console.info("b is ok now"); //eslint-disable-line
      });
      break;
    case 2:
      import("./pages/c").then(() => {
        console.info("c is ok now"); //eslint-disable-line
      });
      break;
    case 3:
      import("./pages/d").then(() => {
        console.info("d is ok now"); //eslint-disable-line
      });
      break;
    case 4:
      import("./pages/e").then(() => {
        console.info("e is ok now"); //eslint-disable-line
      });
      break;
  }
};