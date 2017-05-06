import fs from 'fs';
import { createBundleRenderer } from 'vue-server-renderer';

const app = fs.readFileSync('./public/dist/js/main-server.js', 'utf8');

export default function(url, initialState) {
  const renderer = createBundleRenderer(app);
  return new Promise((resolve, reject) => {
    renderer.renderToString({ url, initialState }, (error, html) => {
      if(error) {
        return reject(error);
      }
      resolve(html);
    });
  });
}
