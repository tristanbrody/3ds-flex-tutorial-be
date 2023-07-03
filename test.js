Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
const iat = Math.floor(new Date().getTime() / 1000);
const exp = Math.floor(new Date().addHours(1) / 1000);