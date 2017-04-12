/*
	---------------------------------------------------
	mColor
	A basic color library that takes a RGB color, then
	can perform lightness operations on it based in the
	LAB or sRGB color space, then return RGB, LAB, or HSL.

	Version 1.2.1
	---------------------------------------------------
*/

function mColor(mc){
	// console.log('\nmColor: passed \t\t' + JSON.stringify(mc));

	this.rgb = importRGB(mc);
	this.lab = false;
	this.hsl = false;

	// console.log('mColor: imported\t' + JSON.stringify(this.rgb));

	this.getString = function(){
		var re = 'rgb('+sanitizeRGB(this.rgb.r)+','+sanitizeRGB(this.rgb.g)+','+sanitizeRGB(this.rgb.b)+')';
		// var re = 'rgb('+this.rgb.r+','+this.rgb.g+','+this.rgb.b+')';

		return re;
	};

	this.getHex = function() {
		return (
			'#' +
			(0x100 | Math.round(this.rgb.r)).toString(16).substr(1) +
			(0x100 | Math.round(this.rgb.g)).toString(16).substr(1) +
			(0x100 | Math.round(this.rgb.b)).toString(16).substr(1)
		);
	};

	this.getLAB = function(){
		if(!this.lab) this.lab = SRGBtoLAB({r:this.rgb.r, g:this.rgb.g, b:this.rgb.b});
		return this.lab;
	};

	this.getHSL = function() {
		if(!this.hsl) this.hsl = RGBtoHSL({r:this.rgb.r, g:this.rgb.g, b:this.rgb.b});
		return this.hsl;
	}

	this.getLightness = function(type) {
		// Lightness from 0.0 to 1.0

		var l;
		type = type || 'srgb';
		type = type.toLowerCase();

		if(type === 'lab') l = this.getLAB().l / 100;	// LAB lightness math done in 0-100
		else if(type === 'hsl') l = this.getHSL().l;
		else {
			if(!this.rgb.l) this.rgb.l = calculateSRGBlightness(this.rgb);
			l = this.rgb.l;
		}

		// console.log('getLightness for ' + type + ' returning ' + l);
		return l;
	};

	this.setLightness = function(setl, type) {
		// Lightness from 0.0 to 1.0
		// console.log('setLightness for ' + type + ' at ' + setl);

		type = type || 'srgb';
		type = type.toLowerCase();

		var tc, rgb;
		var lightness = this.getLightness(type);

		if(type === 'lab'){
			tc = this.getLAB();
			rgb = LABtoSRGB({l:(setl * 100), a:tc.a, b:tc.b});	// LAB lightness math done in 0-100

		} else if(type === 'hsl'){
			tc = this.getHSL();
			rgb = HSLtoRGB({h:tc.h, s:tc.s, l:setl});
		}

		return new mColor(rgb);
	};

	this.setHue = function(seth){
		var hsl = this.getHSL();
		hsl.h = seth;
		var rgb = HSLtoRGB(hsl);

		return new mColor(rgb);
	}

	this.lighten = function(lpercent, type){
		// Percent as a decimal between 0.0 and 1.0
		// console.log('lighten for ' + type + ' at ' + lpercent);

		lpercent = Math.max(0, Math.min(1, lpercent));

		var tl = this.getLightness(type);
		// console.log('\t old lightness: ' + tl);

		var newl = tl + ((1-tl)*lpercent);
		// console.log('\t new lightness: ' + newl);

		return this.setLightness(newl, type);
	};

	this.darken = function(dpercent, type){
		// Percent as a decimal between 0.0 and 1.0
		// console.log('darken for ' + type + ' at ' + dpercent);

		dpercent = Math.max(0, Math.min(1, dpercent));

		var td = this.getLightness(type);
		// console.log('\t old darkness: ' + td);

		var newd = td - (td*dpercent);
		// console.log('\t new darkness: ' + newd);

		return this.setLightness(newd, type);
	};

	this.toString = function(){
		var re = '';

		re += 'RGB:\t' + this.rgb.r + '\t' + this.rgb.g + '\t' + this.rgb.b + '\t' + this.rgb.l + '\n';
		re += 'HSL:\t' + this.hsl.h + '\t' + this.hsl.s + '\t' + this.hsl.l + '\n';
		re += 'LAB:\t' + this.lab.l + '\t' + this.lab.a + '\t' + this.lab.b + '\n';

		return re;
	};
}



/*
	--------------------
	RGB Helper Functions
	--------------------
*/

// Handles inputs as rgb, hex, or object
// By default, a color will be returned no matter what
// If `validate` is true, then unsupported formats will
// fail and return false
function importRGB(oa, validate) {
	// console.log('importRGB passed\t' + JSON.stringify(oa));

	var re = {r: 127, g: 127, b: 127};

	function hexToDec(hex) { return sanitizeRGB(parseInt(hex, 16), validate); }

	function parseHex(hex, c) {
		var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i)

		if(m){
			if(m[1].length > 3) {
				// 6-char notation.  Fails gracefully for 4, 5, or 7+
				c.r = hexToDec(m[1].substr(0,2), validate);
				c.g = hexToDec(m[1].substr(2,2), validate);
				c.b = hexToDec(m[1].substr(4,2), validate);

			} else {
				// 3-char notation. Fails gracefully for 0, 1, or 2
				c.r = hexToDec(m[1].charAt(0)+m[1].charAt(0), validate);
				c.g = hexToDec(m[1].charAt(1)+m[1].charAt(1), validate);
				c.b = hexToDec(m[1].charAt(2)+m[1].charAt(2), validate);
			}
		}

		return c;
	}

	// Main format detection
	if(typeof oa === 'string'){

		if(oa.indexOf('rgb(') === 0){
			// like 'rgb(255,255,255)'
			var sp = oa.split('(')[1].split(')')[0].split(',');
			re.r = sanitizeRGB(sp[0], validate);
			re.g = sanitizeRGB(sp[1], validate);
			re.b = sanitizeRGB(sp[2], validate);

		} else if (oa.indexOf('#') === 0){
			// like '#FFF' or '#FFFFFF'
			oa = oa.slice(1);
			re = parseHex(oa, re);

		} else {
			// like 'FFF' or 'FFFFFF' (or failure cases)
			re = parseHex(oa, re);
		}

	} else if (typeof oa === 'number'){
		// like 0xFFF or 0xFFFFFF
		// ToDo

	} else if (typeof oa === 'object'){
		// like {r:255, g:255, b:255}
		re.r = sanitizeRGB(oa.r, validate);
		re.g = sanitizeRGB(oa.g, validate);
		re.b = sanitizeRGB(oa.b, validate);
	}

	if(validate){
		if(re.r === false || re.g === false || re.b === false) return false;
	}

	// console.log('importRGB returning\t' + JSON.stringify(re));
	return re;
}


// Sanitizes an input to a valid RGB value
// By default, a color value will be returned no matter what
// If `validate` is true, then bad RGB values will
// fail and return false
function sanitizeRGB(n, validate){
	if(n !== undefined) {
		n = parseInt(n);
		if(typeof n === 'number' && !isNaN(n)){
			return Math.max(0, Math.min(255, Math.round(n)));
		}
	}

	return validate? false : 127;
}


function sanitizeFloat(n, validate) {
	if(n !== undefined) {
		n = parseFloat(n);
		if(typeof n === 'number' && !isNaN(n)){
			return Math.max(0, Math.min(1, n));
		}
	}

	return validate? false : 0;
}

// Takes Standard RGB and calculates it's lightness value
function calculateSRGBlightness(rgb) {
	// sRGB lightness : decimal 0.0 to 1.0

	function shift(c) {
		c /= 255;
		c = (c <= 0.03928) ? c/12.92 : Math.pow(((c + 0.055)/1.055), 2.4);

		return c;
	}

	var lr = shift(rgb.r);
	var lg = shift(rgb.g);
	var lb = shift(rgb.b);

	var l = ((0.2126 * lr) + (0.7152 * lg) + (0.0722 * lb));

	// console.log('calculateSRGBlightness returns:\t' + l);
	return l;
}


/*
	----------------------------
	Generic conversion funcitons
	----------------------------
*/

function SRGBtoXYZ(srgb){
	var xyz = {};
	srgb.r /= 255;
	srgb.g /= 255;
	srgb.b /= 255;

	for (var tc1 in srgb) {
		if (srgb[tc1] > 0.04045) {
			srgb[tc1] = Math.pow(((srgb[tc1] + 0.055) / 1.055), 2.4);
		} else {
			srgb[tc1] /= 12.92;
		}

		srgb[tc1] = srgb[tc1] * 100;
	}

	xyz = {
		x : (srgb.r * 0.4124) + (srgb.g * 0.3576) + (srgb.b * 0.1805),
		y : (srgb.r * 0.2126) + (srgb.g * 0.7152) + (srgb.b * 0.0722),
		z : (srgb.r * 0.0193) + (srgb.g * 0.1192) + (srgb.b * 0.9505)
	};

	xyz.x = Math.max(0, Math.min(95.047, xyz.x));
	xyz.y = Math.max(0, Math.min(100, xyz.y));
	xyz.z = Math.max(0, Math.min(108.883, xyz.z));

	return xyz;
}


function XYZtoSRGB(xyz) {
	var srgb = {};
	xyz.x /= 100;	//X from 0 to  95.047
	xyz.y /= 100;	//Y from 0 to 100.000
	xyz.z /= 100;	//Z from 0 to 108.883

	srgb.r = (xyz.x * 3.2406) + (xyz.y * -1.5372) + (xyz.z * -0.4986);
	srgb.g = (xyz.x * -0.9689) + (xyz.y * 1.8758) + (xyz.z * 0.0415);
	srgb.b = (xyz.x * 0.0557) + (xyz.y * -0.2040) + (xyz.z * 1.0570);

	if (srgb.r > 0.0031308) {
		srgb.r = 1.055 * Math.pow(srgb.r, (1 / 2.4)) - 0.055;
	} else {
		srgb.r *= 12.92;
	}

	if (srgb.g > 0.0031308) {
		srgb.g = 1.055 * Math.pow(srgb.g, (1 / 2.4)) - 0.055;
	} else {
		srgb.g *= 12.92;
	}

	if (srgb.b > 0.0031308) {
		srgb.b = 1.055 * Math.pow(srgb.b, (1 / 2.4)) - 0.055;
	} else {
		srgb.b *= 12.92;
	}

	srgb.r *= 255;
	srgb.g *= 255;
	srgb.b *= 255;

	srgb.r = sanitizeRGB(srgb.r);
	srgb.g = sanitizeRGB(srgb.g);
	srgb.b = sanitizeRGB(srgb.b);

	return srgb;
}


function LABtoXYZ(lab) {
	var xyz = {};
	xyz.y = (lab.l + 16) / 116;
	xyz.x = lab.a / 500 + xyz.y;
	xyz.z = xyz.y - lab.b / 200;

	if (Math.pow(xyz.y,3) > 0.008856) {
		xyz.y = Math.pow(xyz.y,3);
	} else {
		xyz.y = (xyz.y - 16 / 116) / 7.787;
	}

	if (Math.pow(xyz.x,3) > 0.008856) {
		xyz.x = Math.pow(xyz.x,3);
	} else {
		xyz.x = (xyz.x - 16 / 116) / 7.787;
	}

	if (Math.pow(xyz.z,3) > 0.008856) {
		xyz.z = Math.pow(xyz.z,3);
	} else {
		xyz.z = (xyz.z - 16 / 116) / 7.787;
	}

	//  Observer= 2degree, Illuminant= D65
	xyz.x *= 95.047;
	xyz.y *= 100.000;
	xyz.z *= 108.883;

	xyz.x = Math.max(0, Math.min(95.047, xyz.x));
	xyz.y = Math.max(0, Math.min(100, xyz.y));
	xyz.z = Math.max(0, Math.min(108.883, xyz.z));

	return xyz;
}


function XYZtoLAB(xyz) {
	// LAB values will be 0 - 100
	// All other mColor Lightnesses are 0.0 - 1.0

	var xyz2 = {};
	var white = { x : 95.047, y : 100.000, z : 108.883 };

	for (var tc2 in xyz) {
		xyz2[tc2] = xyz[tc2] / white[tc2];

		if (xyz2[tc2] > 0.008856) {
			xyz2[tc2] = Math.pow(xyz2[tc2], (1 / 3));
		} else {
			xyz2[tc2] = (7.787 * xyz2[tc2]) + (16 / 116);
		}
	}

	var lab = {
		l : 116 * xyz2.y - 16,
		a : 500 * (xyz2.x - xyz2.y),
		b : 200 * (xyz2.y - xyz2.z)
	};

	return lab;
}


function SRGBtoLAB(srgb) {
	return XYZtoLAB(SRGBtoXYZ(srgb));
}


function LABtoSRGB(lab) {
	return XYZtoSRGB(LABtoXYZ(lab));
}


function RGBtoHSL(rgb) {
	// r, g, b : integers 0 to 255
	// h, s, l : decimals 0.0 to 1.0

	var hsl = {};
	rgb.r /= 255;
	rgb.g /= 255;
	rgb.b /= 255;


	var min = Math.min(rgb.r, Math.min(rgb.g, rgb.b));
	var max = Math.max(rgb.r, Math.max(rgb.g, rgb.b));
	var delta = max - min;

	hsl.l = (max + min) / 2;

	if (delta == 0){
		hsl.h = 0;
		hsl.s = 0;

	} else {
		if (hsl.l < 0.5) hsl.s = (delta / (max + min));
		else hsl.s = (delta / (2 - max - min));

		var deltaR = ((((max - rgb.r) / 6) + (delta / 2)) / delta);
		var deltaG = ((((max - rgb.g) / 6) + (delta / 2)) / delta);
		var deltaB = ((((max - rgb.b) / 6) + (delta / 2)) / delta);

		if (rgb.r == max) hsl.h = (deltaB - deltaG);
		else if (rgb.g == max) hsl.h = ((1 / 3) + deltaR - deltaB);
		else if (rgb.b == max) hsl.h = ((2 / 3) + deltaG - deltaR);

		if (hsl.h < 0) hsl.h += 1;
		if (hsl.h > 1) hsl.h -= 1;
	}

	hsl.h = sanitizeFloat(hsl.h);
	hsl.s = sanitizeFloat(hsl.s);
	hsl.l = sanitizeFloat(hsl.l);

	// console.log('RGBtoHSL returns:\t' + JSON.stringify(hsl));
	return hsl;
}


function HSLtoRGB(hsl) {
	// h, s, l : decimals 0.0 to 1.0
	// r, g, b : integers 0 to 255

	var rgb = {};

	function HtoRGB(v1, v2, vH){
		if (vH < 0) vH += 1;
		if (vH > 1) vH -= 1;
		if ((6 * vH) < 1) return (v1 + (v2 - v1) * 6 * vH);
		if ((2 * vH) < 1) return (v2);
		if ((3 * vH) < 2) return (v1 + (v2 - v1) * ((2 / 3) - vH) * 6);
		return v1;
	}

	if (hsl.s == 0){
		rgb.r = hsl.l * 255;
		rgb.g = hsl.l * 255;
		rgb.b = hsl.l * 255;

	} else {
		var p1, p2;

		p2 = (hsl.l < 0.5) ? (hsl.l * (1 + hsl.s)) : ((hsl.l + hsl.s) - (hsl.s * hsl.l));
		p1 = 2 * hsl.l - p2;

		rgb.r = 255 * HtoRGB(p1, p2, (hsl.h + (1/3)));
		rgb.g = 255 * HtoRGB(p1, p2, hsl.h);
		rgb.b = 255 * HtoRGB(p1, p2, (hsl.h - (1/3)));
	}

	rgb.r = sanitizeRGB(rgb.r);
	rgb.g = sanitizeRGB(rgb.g);
	rgb.b = sanitizeRGB(rgb.b);

	// console.log('HSLtoRGB returns:\t' + JSON.stringify(rgb));
	return rgb;
}