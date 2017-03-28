/*
	---------------------------------------------------
	mColor
	A basic color library that takes a RGB color, then 
	can perform lightness operations on it based in the 
	LAB color space, then return RGB, LAB, or HSL.

	Version 1.2.0
	---------------------------------------------------
*/

function mColor(mc){
	// console.log('\nmColor: passed \t\t' + JSON.stringify(mc));
	
	this.rgb = importRGB(mc);
	this.lab = false;
	this.hsl = false;

	// console.log('mColor: imported\t' + JSON.stringify(this.rgb));

	this.getString = function(){
		var re = 'rgb('+san(this.rgb.r)+','+san(this.rgb.g)+','+san(this.rgb.b)+')';
		// var re = 'rgb('+this.rgb.r+','+this.rgb.g+','+this.rgb.b+')';
		
		return re;
	};

	this.getLightness = function() {
		if(!this.lab) this.lab = RGBtoLAB({r:this.rgb.r, g:this.rgb.g, b:this.rgb.b});
		return this.lab.l;
	};

	this.getLAB = function(){
		if(!this.lab) this.lab = RGBtoLAB({r:this.rgb.r, g:this.rgb.g, b:this.rgb.b});
		return this.lab;
	};

	this.getHSL = function() {
		if(!this.hsl) this.hsl = RGBtoHSL({r:this.rgb.r, g:this.rgb.g, b:this.rgb.b});
		return this.hsl;
	}

	this.lighten = function(lpercent){
		// Percent as a decimal between 0 and 1
		lpercent = Math.max(0, Math.min(1, lpercent));
		var tl = this.getLightness();
		var newl = tl + ((100-tl)*lpercent);
		
		return this.setLightness(newl);
	};

	this.darken = function(dpercent){
		// Percent as a decimal between 0 and 1
		dpercent = Math.max(0, Math.min(1, dpercent));
		var td = this.getLightness();
		var newd = td - (td*dpercent);
		
		return this.setLightness(newd);
	};

	this.setLightness = function(setl) {
		// Lightness from 0 to 100
		var lab = this.getLAB();		
		lab.l = setl;
		var rgb = LABtoRGB(lab);

		return new mColor(rgb);
	};

	this.setHue = function(seth){
		var hsl = this.getHSL();
		hsl.h = seth;
		var rgb = HSLtoRGB(hsl);

		return new mColor(rgb);
	}
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

	if(typeof oa === 'string'){

		if(oa.indexOf('rgb(') === 0){
			var sp = oa.split('(')[1].split(')')[0].split(',');
			re.r = san(sp[0], validate);
			re.g = san(sp[1], validate);
			re.b = san(sp[2], validate);
		
		} else if (oa.indexOf('#') === 0){
			re.r = san(parseInt(oa.substr(1,2), 16), validate);
			re.g = san(parseInt(oa.substr(3,2), 16), validate);
			re.b = san(parseInt(oa.substr(5,2), 16), validate);
		
		} else {
			if(validate) return false;
		}

	} else if (typeof oa === 'object'){
		re.r = san(oa.r, validate);
		re.g = san(oa.g, validate);
		re.b = san(oa.b, validate);
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
function san(n, validate){
	if(n !== undefined) {
		n = parseInt(n);
		if(typeof n === 'number' && !isNaN(n)){
			return Math.max(0, Math.min(255, Math.round(n)));
		}
	}

	return validate? false : 127;
}



/*
	----------------------------
	Generic conversion funcitons
	----------------------------
*/

function RGBtoXYZ(rgb){
	var xyz  = {};
	rgb.r /= 255;
	rgb.g /= 255;
	rgb.b /= 255;

	for (var tc1 in rgb) {
		if (rgb[tc1] > 0.04045) {
			rgb[tc1] = Math.pow(((rgb[tc1] + 0.055) / 1.055), 2.4);
		} else {
			rgb[tc1] /= 12.92;
		}

		rgb[tc1] = rgb[tc1] * 100;
	}

	xyz = {
		x : rgb.r * 0.4124 + rgb.g * 0.3576 + rgb.b * 0.1805,
		y : rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722,
		z : rgb.r * 0.0193 + rgb.g * 0.1192 + rgb.b * 0.9505
	};

	xyz.x = Math.max(0, Math.min(95.047, xyz.x));
	xyz.y = Math.max(0, Math.min(100, xyz.y));
	xyz.z = Math.max(0, Math.min(108.883, xyz.z));

	return xyz;
}


function XYZtoRGB(xyz) {
	var rgb = {};
	xyz.x /= 100;	//X from 0 to  95.047
	xyz.y /= 100;	//Y from 0 to 100.000
	xyz.z /= 100;	//Z from 0 to 108.883

	rgb.r = xyz.x *  3.2406 + xyz.y * -1.5372 + xyz.z * -0.4986;
	rgb.g = xyz.x * -0.9689 + xyz.y *  1.8758 + xyz.z *  0.0415;
	rgb.b = xyz.x *  0.0557 + xyz.y * -0.2040 + xyz.z *  1.0570;

	if (rgb.r > 0.0031308) {
		rgb.r = 1.055 * Math.pow(rgb.r, (1 / 2.4)) - 0.055;
	} else {
		rgb.r *= 12.92;
	}

	if (rgb.g > 0.0031308) {
		rgb.g = 1.055 * Math.pow(rgb.g, (1 / 2.4)) - 0.055;
	} else {
		rgb.g *= 12.92;
	}

	if (rgb.b > 0.0031308) {
		rgb.b = 1.055 * Math.pow(rgb.b, (1 / 2.4)) - 0.055;
	} else {
		rgb.b *= 12.92;
	}

	rgb.r *= 255;
	rgb.g *= 255;
	rgb.b *= 255;

	rgb.r = san(rgb.r);
	rgb.g = san(rgb.g);
	rgb.b = san(rgb.b);

	return rgb;
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
	xyz.x *=  95.047;
	xyz.y *= 100.000;
	xyz.z *= 108.883;

	xyz.x = Math.max(0, Math.min(95.047, xyz.x));
	xyz.y = Math.max(0, Math.min(100, xyz.y));
	xyz.z = Math.max(0, Math.min(108.883, xyz.z));

	return xyz;
}


function XYZtoLAB(xyz) {
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


function RGBtoLAB(rgb) {
	return XYZtoLAB(RGBtoXYZ(rgb));
}


function LABtoRGB(lab) {
	return XYZtoRGB(LABtoXYZ(lab));
}


function RGBtoHSL(rgb) {
	var hsl = {};
	rgb.r /= 255;
	rgb.g /= 255;
	rgb.b /= 255;


	var min = Math.min( rgb.r, Math.min(rgb.g, rgb.b));
	var max = Math.max( rgb.r, Math.max(rgb.g, rgb.b));
	var delta = max - min;

	hsl.l = (max + min) / 2

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
	   else if (rgb.g == max) hsl.h = (( 1 / 3 ) + deltaR - deltaB);
	   else if (rgb.b == max) hsl.h = (( 2 / 3 ) + deltaG - deltaR);

	   if (hsl.h < 0 ) hsl.h += 1;
	   if (hsl.h > 1 ) hsl.h -= 1;
	}

	return hsl;
}


function HSLtoRGB(hsl) {
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
		p1 = 2 * hsl.l - p2

		rgb.r = 255 * HtoRGB(p1, p2, H + (1 / 3)) 
		rgb.g = 255 * HtoRGB(p1, p2, H)
		rgb.b = 255 * HtoRGB(p1, p2, H - (1 / 3))
	}

	return rgb;
}