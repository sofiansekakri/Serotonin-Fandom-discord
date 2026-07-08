module.exports = {
    triangular:function(n) {
        if (typeof n !== 'number') {
            throw new TypeError('Use a number instead.');
        }
        return n*(n+1)/2;
    },
    factorial:function(n) {
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
            throw new TypeError('Use a non-negative integer.');
        }
        if (n === 0 || n === 1) {
            return 1;
        }
        let sum = 1;
        for (let i = 2; i <= n; i++) {
            sum *= i;
        }
        return sum;   
    },
    Logarithm: class Log {
            constructor(n = Math.E) {
                if (n === 'e') n = Math.E;
                if (n === 'π') n = Math.PI;
                if (typeof n !== 'number'|| n <= 0 || n === 1) {
                    throw new TypeError('Logarithmic bases have to be a positive number other than 0 and 1.');
                }
                this.base = n;
                this.equ = new Map();
            }
            getExponent(n) {
                if (n === 'e') n = Math.E;
                if (n === 'π') n = Math.PI;
                if (typeof n !== 'number' || n <= 0) {
                    throw new TypeError('Sum has to be a positive number.');
                }
                const res = Math.log(n) / Math.log(this.base);
                this.equ.set(n, res);
                return res;
            }
            getEquations(n) {
                if (
                    (typeof n !== 'number' && !Array.isArray(n))
                    || (typeof n === 'number' && n <= 0)
                ) {
                    throw new TypeError('Use a positive number or an array of results.');
                }
                let results = new Map();
                if (Array.isArray(n)) {
                        n.forEach(int => {
                        if (int === 'e') int = Math.E;
                        if (int === 'π') int = Math.PI;
        
                        if (typeof int !== 'number') {
                            throw new TypeError('Array includes non number objects.');
                        }
        
                        if (this.equ.has(int)) {
                            results.set(int, this.equ.get(int));
                        }
                    });
                    return results;
                }
                return this.equ.get(n);
            }
        },
    toBinary: function(n) {
        if (!Number.isInteger(n) || n < 0) {
            throw new TypeError('Use a non-negative integer');
        }
        if (n === 0) return '0';
        let binary = [];
        while (n > 0) {
            binary.unshift(n % 2);
            n = Math.floor(n / 2);
        }
        return binary.join('');
    },
    toInt: function(n) {
        if (typeof n === 'string')  {
            if (!/^[01]+$/.test(n)) {
                throw new TypeError('input includes invalid binary.');
            }
        } else {
            throw new TypeError('input is not String.');
        }
        return parseInt(n, 2);
    },
    randomInt: function(min, max) {
        if (typeof min !== 'number' || typeof max !== 'number') {
            throw new TypeError('Must be a number.');
        } 
        if (min >= max) {
            throw new TypeError('The maximum value needs to exceed the minimum value.');
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randomItem: function(items = []) {
        if (!Array.isArray(items)) throw new TypeError('use an array.');
        return items[Math.floor(Math.random() * items.length)];
    }
}