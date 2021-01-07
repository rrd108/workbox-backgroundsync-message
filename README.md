# Workbox BackgroundSync Message

This plugin extends workbox backgroundsync plugin with catching response messages and send them to the UI thread. It is useful when you need the response from the API server after background-sync was successful.

> This class is made for `@vue/cli-plugin-pwa` what uses workbox 4.3.1. At the time of writing of this plugin, the current workbox version is 6.0.2 but this functionality is still missing.

Workbox backgroundSync is amazing [https://developers.google.com/web/tools/workbox/modules/workbox-background-sync](https://developers.google.com/web/tools/workbox/modules/workbox-background-sync) but I think in **most cases** we need the response from the API when the backgroundSync is finished.

**Pull requests are welcome**

# Usage

There are a few things should be in place to get the response

1. Copy the plugin file to `src`

````
cp node_modules/@rrd/workbox-backgroundsync-message/backgroundSyncMessagePlugin.js src/
````

First copy the plugin file from your `node_modules` folder to your `src` folder. As service workers have their own scope it should be done manually, it can not be imported.
This step should be done again on updating this plugin.
(Maybe a `postbuild` script in `package.json` could solve this).

2. `/vue.config.js`

````js
module.exports = {
  pwa: {
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: './src/sw.js',
    }
  }
}
````

3. `/src/sw.js`

````js
importScripts('/backgroundSyncMessagePlugin.js')

// your workbox service worker stuff here

// and use this plugin for any of your routes
workbox.routing.registerRoute(
  'https://your.apiurl.here',
  new workbox.strategies.NetworkOnly({
    plugins: [
      new BackgroundSyncMessagePlugin('your-choosen-queue-name', { maxRetentionTime: 1440 })
    ]
  }),
  'POST'
)
````

4. At any of your components

````js
created(){
    navigator.serviceWorker.addEventListener('message', event => {
      console.warn('message got in this component', event.data);
    });
  },
````
