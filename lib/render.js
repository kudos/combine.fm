import fs from 'fs';
import vueServerRenderer from 'vue-server-renderer';

const createBundleRenderer = vueServerRenderer.createBundleRenderer;

const app = fs.readFileSync('./public/dist/js/main-server.js', 'utf8');
const renderer = createBundleRenderer(app);

export default function(url, initialState) {
  return new Promise((resolve, reject) => {
    renderer.renderToString({ url, initialState }, (error, html) => {
      if(error) {
        return reject(error);
      }
      resolve(html);
    });
  });
}
