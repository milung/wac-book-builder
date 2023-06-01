const http = require('http');
const httpProxy = require('http-proxy');
const { runInNewContext } = require('vm');



const proxySpa = new httpProxy.createProxyServer({
    target: {
        host: '127.0.0.1',
        port: 3333,
    }
});

proxySpa.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.path = '/ui';
  });
const proxyStencil = new httpProxy.createProxyServer({
    target: {
        host: '127.0.0.1',
        port: 3333
    }
});
proxyStencil.on('error', function(err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
   
    res.end('Dev Server is disconnected');
  });

const proxyServer = http.createServer(function (req, res) {
    console.log(req.url);
    if ( req.url.match(/\/book\//)  ||  req.url.match(/\.[a-z\-\_0-9]+($|#.*$|\?.*)/) ) {
        console.log('stencil');
        proxyStencil.web(req, res);
    }  else {
        console.log('spa');
        proxySpa.web(req, res);
    }
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
   
    proxyStencil.ws(req, socket, head);
});

console.log('Listen: http://localhost:3380');
proxyServer.listen(3380);