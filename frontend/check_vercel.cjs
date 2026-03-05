const https = require('https');
const fs = require('fs');
https.get('https://touriffy.vercel.app/', res => {
    let html = '';
    res.on('data', d => html += d);
    res.on('end', () => {
        const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
        if (!scriptMatch) return console.log('No script found', html);
        const scriptUrl = 'https://touriffy.vercel.app' + scriptMatch[1];
        console.log('Script URL:', scriptUrl);
        https.get(scriptUrl, jsRes => {
            let js = '';
            jsRes.on('data', d => js += d);
            jsRes.on('end', () => {
                fs.writeFileSync('bundle.js', js);
                console.log('Bundle downloaded to bundle.js');

                // execute to find top-level errors
                try {
                    const vm = require('vm');
                    const context = {
                        console: console,
                        window: {},
                        document: {
                            createElement: () => ({ relList: {} }),
                            querySelectorAll: () => []
                        },
                        self: {},
                        navigator: { userAgent: 'node' }
                    };
                    context.window.document = context.document;
                    vm.createContext(context);
                    vm.runInContext(js, context);
                    console.log('No module load error in VM.');
                } catch (e) {
                    console.error('VM EXCEPTION:', e.message);
                }
            });
        });
    });
});
