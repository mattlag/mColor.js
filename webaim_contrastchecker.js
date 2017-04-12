/* Color contrast script for http://webaim.org/resources/contrastchecker/
Authored by Jared Smith.
Nothing here is too earth shattering, but if you're reading this, you must be interested. Feel free to steal, borrow, or use this code however you would like.
The color picker is jscolor - http://jscolor.com/
*/

function checkcontrast() {
	var normal = document.getElementById("normal");
	var big = document.getElementById("big");
	var contrastratio = document.getElementById("contrastratio");
	var normalaa = document.getElementById("normalaa");
	var normalaaa = document.getElementById("normalaaa");
	var bigaa = document.getElementById("bigaa");
	var bigaaa = document.getElementById("bigaaa");
	var fg = document.getElementById("fg");
	var bg = document.getElementById("bg");
	
	var color=getColor("foreground");
	var bgcolor=getColor("background");

	var L1 = getL(color);
	var L2 = getL(bgcolor);
	
	if (L1!==false && L2!==false) {
		normal.style.color = "#"+color;
		normal.style.backgroundColor = "#"+bgcolor;
		big.style.color = "#"+color;
		big.style.backgroundColor = "#"+bgcolor;
		fg.style.backgroundColor = "#"+color;
		bg.style.backgroundColor = "#"+bgcolor;
		var ratio = (Math.max(L1, L2) + 0.05)/(Math.min(L1, L2) + 0.05);
		contrastratio.innerHTML = (Math.round(ratio*100)/100) + ":1";
		if(ratio >= 4.5) {
			normalaa.innerHTML = "Pass";
			normalaa.className='pass';
			bigaaa.innerHTML = "Pass";
			bigaaa.className="pass";
		}
		else {
			normalaa.innerHTML = "Fail";
			normalaa.className="fail";
			bigaaa.innerHTML = "Fail";
			bigaaa.className="fail";
		}
		if(ratio >= 3) {
			bigaa.innerHTML = "Pass";
			bigaa.className='pass';
		}
		else {
			bigaa.innerHTML = "Fail";
			bigaa.className='fail';
		}
		if(ratio >= 7) {
			normalaaa.innerHTML = "Pass";
			normalaaa.className='pass';
		}
		else {
			normalaaa.innerHTML = "Fail";
			normalaaa.className='fail';
		}
	}
	else {
		normal.style.color = "#00f";
		normal.style.backgroundColor = "#fff";
		big.style.color = "#00f";
		big.style.backgroundColor = "#fff";
		contrastratio.innerHTML = "N/A";
		normalaa.innerHTML = "?";
		normalaaa.innerHTML = "?";
		bigaa.innerHTML = "?";
		bigaaa.innerHTML = "?";
	}
}


function getL(color) {
	if(color.length == 3) {
		var R = getsRGB(color.substring(0,1) + color.substring(0,1));
		var G = getsRGB(color.substring(1,2) + color.substring(1,2));
		var B = getsRGB(color.substring(2,3) + color.substring(2,3));
		update = true;
	}
	else if(color.length == 6) {
		var R = getsRGB(color.substring(0,2));
		var G = getsRGB(color.substring(2,4));
		var B = getsRGB(color.substring(4,6));
		update = true;
	}
	else {
		update = false;
	}
	if (update == true) {
		var L = (0.2126 * R + 0.7152 * G + 0.0722 * B);
		return L;
	}
	else {
		return false;
	}
	
}

function getsRGB(color) {
	color=getRGB(color);
	if(color!==false) {
		color = color/255;
		color = (color <= 0.03928) ? color/12.92 : Math.pow(((color + 0.055)/1.055), 2.4);
		return color;
	}
	else { 
		return false;
	}
}

function getRGB(color) {
	try {
		var color = parseInt(color, 16);
	}
	catch (err) {
		var color = false;
	}
	return color;
}

function changehue(loc,dir) {
	var color=getColor(loc);
	if(color.length == 3) {
		var R = color.substring(0,1) + color.substring(0,1);
		var G = color.substring(1,2) + color.substring(1,2);
		var B = color.substring(2,3) + color.substring(2,3);
	}
	else if(color.length == 6) {
		var R = color.substring(0,2);
		var G = color.substring(2,4);
		var B = color.substring(4,6);
		update = true;
	}
	else {
		update=false;
	}
	R = getRGB(R);
	G = getRGB(G);
	B = getRGB(B);

	HSL = RGBtoHSL(R, G, B);
	var lightness = HSL[2];
	if (update==true) {
		lightness = (dir=="lighten") ? lightness+6.25 : lightness-6.25;
		if (lightness>100) {
			lightness=100;
		}
		if (lightness<0) {
			lightness=0;
		}
		RGB = hslToRgb(HSL[0],HSL[1],lightness);
		R = RGB[0];
		G = RGB[1];
		B = RGB[2];
		if(!(R>=0)&&!(R<=255)) R=0
		if(!(G>=0)&&!(G<=255)) G=0
		if(!(B>=0)&&!(B<=255)) B=0
		R = (R >= 16) ? R.toString(16) : "0" + R.toString(16);
		G = (G >= 16) ? G.toString(16) : "0" + G.toString(16);
		B = (B >= 16) ? B.toString(16) : "0" + B.toString(16);
		R = (R.length==1) ? R + R : R;
		G = (G.length==1) ? G + G : G;
		B = (B.length==1) ? B + B : B;
		document.getElementById(loc).value=R + G + B;
		checkcontrast();
	}
}

function RGBtoHSL(r,g,b)
{
	var Min=0;
	var Max=0;
	r=(eval(r)/51)*.2;
	g=(eval(g)/51)*.2;
	b=(eval(b)/51)*.2;

	if (eval(r)>=eval(g))
		Max=eval(r);
	else
		Max=eval(g);
	if (eval(b)>eval(Max))
		Max=eval(b);
	
	if (eval(r)<=eval(g))
		Min=eval(r);
	else
		Min=eval(g);
	if (eval(b)<eval(Min))
		Min=eval(b);

	L=(eval(Max)+eval(Min))/2;
	if (eval(Max)==eval(Min)) 
	{
		S=0;
		H=0;
	} 
	else 
	{
		if (L < .5)
			S=(eval(Max)-eval(Min))/(eval(Max)+eval(Min));
		if (L >= .5)
			S=(eval(Max)-eval(Min))/(2-eval(Max)-eval(Min));
		if (r==Max)
			H = (eval(g)-eval(b))/(eval(Max)-eval(Min));
		if (g==Max)
			H = 2+((eval(b)-eval(r))/(eval(Max)-eval(Min)));
		if (b==Max)
			H = 4+((eval(r)-eval(g))/(eval(Max)-eval(Min)));
	}
	H=Math.round(H*60);
	if(H<0) H += 360;
	if(H>=360) H -= 360;
	S=Math.round(S*100);
	L=Math.round(L*100);
	return  [H, S, L];
}

function hslToRgb(H, S, L){
   	var p1,p2;
	L/=100;
	S/=100;
	if (L<=0.5) p2=L*(1+S);
	else p2=L+S-(L*S);
	p1=2*L-p2;
	if (S==0) 
	{
		R=L; 
		G=L;
		B=L;
	} 
	else 
	{
		R=FindRGB(p1,p2,H+120);
		G=FindRGB(p1,p2,H);
		B=FindRGB(p1,p2,H-120);
	}
	R *= 255;
	G *= 255;
	B *= 255;
	R=Math.round(R);
	G=Math.round(G);
	B=Math.round(B);

    return [R, G, B];
};

function FindRGB(q1,q2,hue) 
{
	if (hue>360) hue=hue-360;
	if (hue<0) hue=hue+360;
	if (hue<60) return (q1+(q2-q1)*hue/60);
	else if (hue<180) return(q2);
	else if (hue<240) return(q1+(q2-q1)*(240-hue)/60);
	else return(q1);
}