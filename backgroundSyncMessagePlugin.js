class BackgroundSyncMessagePlugin extends workbox.backgroundSync.Plugin {

  constructor(...queueArgs) {
    let args = { ...queueArgs}
    super(args[0], { ...args[1], onSync: QueueMessage.replayRequestsMessage })
    //console.log('%cBackgroundSyncMessagePlugin', 'font-weight:bold;background:#4c8;color:#fff;padding:2px 0.5em', 'constructor called')
  }

  // fetchDidSucceed callback is NOT fired for backgroundSync

}

class QueueMessage extends workbox.backgroundSync.Queue {
  async replayRequests() {
    if (process.env.NODE_ENV !== 'production') {
      logger.log('replayRequestsMessage called')
    }
    let entry;
    while (entry = await this.shiftRequest()) {
      try {

        // the original function call does not do anything with the response
        fetch(entry.request.clone())
          .then(response => response.json())
          .then(data => {
            self.clients.matchAll()
              .then(function (clients) {
                if (clients && clients.length) {
                  //Respond to last focused tab
                  clients[0].postMessage(data)
                }
              })
            })
        // custom modification of the replayRequestMessage method ends here

        if (process.env.NODE_ENV !== 'production') {
          logger.log(`Request for '${getFriendlyURL(entry.request.url)}'` +
              `has been replayed in queue '${this._name}'`)
        }
      } catch (error) {
        await this.unshiftRequest(entry);

        if (process.env.NODE_ENV !== 'production') {
          logger.log(`Request for '${getFriendlyURL(entry.request.url)}'` +
              `failed to replay, putting it back in queue '${this._name}'`)
        }
        throw new WorkboxError('queue-replay-failed', {name: this._name})
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      logger.log(`All requests in queue '${this.name}' have successfully ` +
          `replayed; the queue is now empty!`)
    }
  }
}