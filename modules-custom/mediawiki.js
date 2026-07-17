module.exports = {
    parse: class parse {
        constructor(api, title, content) {
            if (!api || typeof api !== 'string' || api.trim() === '' || !/^https?:\/\/.+/.test(api) || !api.endsWith('api.php')) {
                throw new TypeError('API must be a valid URL string.');
            }
            if (!content || typeof content !== 'string') {
                throw new TypeError('Content must be a non-empty string.');
            }
            this.api = api;
            this.title = title ?? null;
            this.content = content;
        }
        async parseContent() {
            const response = await fetch(this.api, {
                method: 'POST',
                headers: {},
                body: new URLSearchParams({
                    action: 'parse',
                    format: 'json',
                    text: this.content,
                    title: this.title ?? ''
                })
            });
            const data = await response.json();
            if (!data || typeof data !== 'object' || !data.parse || !data.parse.text || !data.parse.text['*']) {
                throw new Error('Failed to parse content. Invalid response from API.');
            }
            const res = data.parse?.text?.['*'];
            return res;
        }
    }
};