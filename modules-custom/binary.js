module.exports = {
    convert: function(string) {
        if (typeof string !== 'string') {
            throw new TypeError('Input must be a string.');
        }
        if (string.length === 0) return '';
        const input = string;
        let output = "";
        for (var i = 0; i < input.length; i++) {
            output += input[i].charCodeAt(0).toString(2) + " ";
        }
        return output;
    },
    convertBack: function(string) {
        if (typeof string !== 'string') {
            throw new TypeError('Input must be a string.');
        }
        if (string.length === 0) return '';
        return string
            .trim()
            .split(/\s+/)
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
    }
}