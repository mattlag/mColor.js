/*
	MCOLOR
	
	A basic color library that takes a RGB
	color, then can perform lightness
	operations on it based in the LAB
	color space.

	functions can be chained, like:
	color1.lighten(0.2).getString();
*/

function mcolor(mc){
	this.r = (typeof mc.r === 'number') ? mc.r : 64;
	this.g = (typeof mc.g === 'number') ? mc.g : 64;
	this.b = (typeof mc.b === 'number') ? mc.b : 64;
				
	this.getString = function(){
		var re = 'rgb('+san(this.r)+','+san(this.g)+','+san(this.b)+')';
		//console.log("getString: " + re);
		return re;
	};
	
	function san(n){
		return Math.max(0, Math.min(255, Math.round(n)));
	}

	this.getLightness = function() {
		var rgb  = { r : this.r / 255, g : this.g / 255, b : this.b / 255 };
		
		for (var tc in rgb) {
			if (rgb[tc] > 0.04045) {
				rgb[tc] = Math.pow(((rgb[tc] + 0.055) / 1.055), 2.4);
			} else {
				rgb[tc] /= 12.92;
			}
		
			rgb[tc] = rgb[tc] * 100;
		}
		
		var xyz = Math.max(0, Math.min(100, ((rgb.r*0.2126) + (rgb.g*0.7152) + (rgb.b*0.0722)))) / 100;
		
		if (xyz > 0.008856) {
			xyz = Math.pow(xyz, (1 / 3));
		} else {
			xyz = (7.787 * xyz) + (16 / 116);
		}
		
		var result = ((116 * xyz) - 16);
		//console.log("getLightness: " + result);
		return result;
	};	

	this.lighten = function(lpercent){
		// Percent as a decimal between 0 and 1
		lpercent = Math.max(0, Math.min(1, lpercent));
		var tl = this.getLightness();
		var newl = tl + ((100-tl)*lpercent);
		//console.log("lighten: " + newl);
		return this.setLightness(newl);
	};
	

	this.darken = function(dpercent){
		// Percent as a decimal between 0 and 1
		dpercent = Math.max(0, Math.min(1, dpercent));
		var td = this.getLightness();
		var newd = td - (td*dpercent);
		//console.log("darken: " + newd);
		return this.setLightness(newd);
	};

	this.setLightness = function(setll) {
		// Lightness from 0 to 100

		// RGB to XYZ
		
		var rgb  = { r : this.r / 255, g : this.g / 255, b : this.b / 255 };
		var xyz  = {};
		
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
		
		// XYZ to LAB

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
		
		lab.l = setll;
		xyz = {};
		rgb = {};
		
		// LAB to XYZ
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
		
		
		//	XYZ to RGB
		
		xyz.x /= 100;        //X from 0 to  95.047     
		xyz.y /= 100;        //Y from 0 to 100.000
		xyz.z /= 100;        //Z from 0 to 108.883
		
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
		
		//console.log("setLightness: " + JSON.stringify(rgb));

		return new mcolor(rgb);
	};
}