gsmArena1 = {
Announced: "2016, August", 
CPU: "Quad-core 1.3 GHz Cortex-A53", 
Colors: "Black", 
Dimensions: "191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)", 
OS: "Android 6.0 (Marshmallow)", 
Price: "About 170 EUR", 
Primary: "13 MP, autofocus", 
Resolution: "720 x 1280 pixels, 16:9 ratio (~210 ppi density)", 
Size: "7.0 inches, 135.1 cm<sup>2</sup> (~69.8% screen-to-body ratio)", 
Status: "Available. Released 2016, October", 
Talk time: "Up to 9 h (multimedia)", 
Weight: "260 g (9.17 oz)", 
hits: 269955, 
title: "Acer Iconia Talk S"	, 
}

ebay1 = {
Brand:"Apple",
'Camera Resolution':"8.0MP",
Color:"Space Gray",
'Display Resolution':"1334x750",
Height:"5.44 in.",
MPN:"MG472LL/A",
Model:"6",
'Model Number':"A1586 (CDMA + GSM)",
'Screen Size':"4.7",
UPC:"885909950249, 885909950836",
Weight:"4.55 oz",
Width:"2.64 in.",
}

jb.component('devices.cpu', {
	type: 'feature',
	impl: { 
		$: 'cc.feature',
		name: 'Announced',
		type: 'text',
		derivedFeatures: ['AnnouncedYear'],
		parser: '',
	}
})