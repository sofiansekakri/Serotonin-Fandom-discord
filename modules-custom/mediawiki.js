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
                headers: {}
            });
        }
    }
};