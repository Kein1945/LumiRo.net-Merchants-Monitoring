Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key, default_value) {
    if(this[key] == null){return default_value;}
    return JSON.parse(this.getItem(key));
}