function Vec3f (ix, iy, ip) {
	if(ix != undefined)
		this.set(ix, iy, ip);
	else
		this.set(0, 0, 0);
}

Vec3f.prototype.set = function (ix, iy, ip) {
	this.x = ix;
	this.y = iy;
	this.p = ip;
}
