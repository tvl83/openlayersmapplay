// ########################################
// some constants
// ########################################

//var earth_radius = 3958.75;           // in miles
var earth_radius = 6371.11;           // in km

// ########################################
// calculate route
// ########################################

var routeNo = 0;

function GreatCircleLine(pOrigin, pDest)
{
    var gc = new geo.GreatCircle (pOrigin, pDest);
    var x0 = pOrigin.x;
    var x1 = pDest.x;

    var ls = [];

    if (x0 < x1 && (x1-x0)< 180) //modifiziert
        ls[ls.length] = gc.toLineString(x0, x1);
    else
    {   //### part modifiziert #################
        if (Math.abs(x0-x1) < 180)
            ls[ls.length] = gc.toLineString(x1, x0);
        else if(x0>x1){
            ls[ls.length] = gc.toLineString(x0, 180);
            ls[ls.length] = gc.toLineString(-180, x1);
        }
        else{
            ls[ls.length] = gc.toLineString(x1, 180);
            ls[ls.length] = gc.toLineString(-180, x0);
        }
        //######################################
    }
    return(ls);
}

function show_orthodrome(lyrDistancePoints)
{
    var pt1, pt2;

    if(map.projection != "EPSG:4326")
    {
        var fromProjection = new OpenLayers.Projection(map.projection);
        var toProjection   = new OpenLayers.Projection("EPSG:4326");

        pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y).transform(fromProjection, toProjection);
        pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y).transform(fromProjection, toProjection);
    }
    else
    {
        pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y);
        pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y);
    }

    var pOrigin = new geo.Point(pt1.x, pt1.y);
    var pDest = new geo.Point(pt2.x, pt2.y);

    var ls = GreatCircleLine(pOrigin, pDest);

    addLayer(serverObj["server"][0]);
    var vectors = map.layers[0];
    vectors.name = "Route " + ++routeNo;
    //if(ctrlLyr.redraw()){
    //    console.log("ctrlLyr layer drawn");
    //}

    //var myStyle = OpenLayers.Util.extend({}, vectors.styleMap.styles["default"].defaultStyle);

    var theStyle = [];

    theStyle[theStyle.length] = {strokeColor : vectors.styleMap.styles["default"].defaultStyle.strokeColor, strokeWidth:6};
    theStyle[theStyle.length] = {strokeColor : vectors.styleMap.styles["default"].defaultStyle.strokeColor, strokeWidth:6};

    // Create a feature from the waypoints LineString and display on map
    var route = [];
    for (var i=0; i<ls.length; i++)
        route[i] = new OpenLayers.Feature.Vector (ls[i], null, theStyle[i]);
    vectors.addFeatures(route);
}

// ########################################
// manuelle Eingabe der Punktkoordinaten
// ########################################

function setPointCoordinates()
{
    if(map.projection != "EPSG:4326")
    {
        var fromProjection = new OpenLayers.Projection(map.projection);
        var toProjection   = new OpenLayers.Projection("EPSG:4326");

        var pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y).transform(fromProjection, toProjection);
        var pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y).transform(fromProjection, toProjection);
    }
    else
    {
        var pt1 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[0].geometry.x, lyrDistancePoints.features[0].geometry.y);
        var pt2 = new OpenLayers.Geometry.Point(lyrDistancePoints.features[1].geometry.x, lyrDistancePoints.features[1].geometry.y);
    }

    var Stellen = 4;
    var fktr = Math.pow(10,Stellen);
    var Msg = Math.round(pt1.x*fktr)/fktr + "," + Math.round(pt1.y*fktr)/fktr + "," + Math.round(pt2.x*fktr)/fktr + "," + Math.round(pt2.y*fktr)/fktr;
    var Coordinates = window.prompt("new coordinates in grad", Msg);

    if(Coordinates != Msg && Coordinates!=null)
    {
        var tmp = Coordinates.split(",");

        if(map.projection != "EPSG:4326")
        {
            var toProjection = new OpenLayers.Projection(map.projection);
            var fromProjection   = new OpenLayers.Projection("EPSG:4326");

            var pt1 = new OpenLayers.Geometry.Point(parseFloat(tmp[0]), parseFloat(tmp[1])).transform(fromProjection, toProjection);
            var pt2 = new OpenLayers.Geometry.Point(parseFloat(tmp[2]), parseFloat(tmp[3])).transform(fromProjection, toProjection);
        }
        else
        {
            var pt1 = new OpenLayers.Geometry.Point(parseFloat(tmp[0]), parseFloat(tmp[1]));
            var pt2 = new OpenLayers.Geometry.Point(parseFloat(tmp[2]), parseFloat(tmp[3]));
        }

        lyrDistancePoints.features[0].geometry.x = pt1.x;
        lyrDistancePoints.features[0].geometry.y = pt1.y;
        lyrDistancePoints.features[1].geometry.x = pt2.x;
        lyrDistancePoints.features[1].geometry.y = pt2.y;
    }
    lyrDistancePoints.drawFeature(lyrDistancePoints.features[0]);
    lyrDistancePoints.drawFeature(lyrDistancePoints.features[1]);
}

// ########################################
// layer declarations
// ########################################

var serverObj = {
    server: [
        {
            title: "Vector Layer",
            url: "",
            mapfile: "",
            params : {
                layers        : "Vectors",
                format        : "",
                version       : "",
                transparent   : true
            },
            options : {
                isBaseLayer : false,
                isVisible   : true,
                gutter      : 0,
                buffer      : 1,
                opacity     : 1
            },
            vendor : {
                sid          : "V10100",
                service      : "VECTOR",
                aktlayers    : "Vectors",
                aktqlayers   : "Vectors",
                lyrNames     : ["Vectors"],
                lyrTitles    : ["Vectors"],
                lyrVisible   : [1],
                lyrQueryable : [0],
                lyrQChecked  : [0]
            }
        }
    ]};

// ########################################
// add layer function
// ########################################

function addLayer(obj)
{
    obj["options"].displayOutsideMaxExtent=true;

    if(obj.vendor.service == "GOOGLE")
    {   var lyr = new OpenLayers.Layer.Google(obj["title"], obj["options"]);
        //lyr.service = obj.service;
        lyr.vendor  = obj["vendor"];
        map.addLayer(lyr);
    }
    else if(obj.vendor.service == "BASELAYER")
    {
        var lyr = new OpenLayers.Layer(obj["title"], obj["url"], obj["params"], obj["options"] );
        lyr.vendor  = obj["vendor"];
        lyr.setVisibility(lyr.options.isVisible);
        lyr.isBaseLayer=true;
        map.addLayer(lyr);
    }
    else if(obj.vendor.service == "VECTOR")
    {
        var lyr = new OpenLayers.Layer.Vector("Editable Vectors");
        var randomColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["default"]));
        var selectColorStyle = new OpenLayers.Style(OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["select"]));

        try{
            lyr.styleMap = new OpenLayers.StyleMap({'default':{fillOpacity: 0.5, fillColor: randomColor(128,128,128, 127,127,127), strokeWidth: 3, strokeColor: randomColor(128,128,128, 127,127,127, true), pointRadius: 3}, 'select':{fillOpacity: 0.5, fillColor: 'yellow', strokeWidth: 2, strokeColor: 'yellow', pointRadius: 5}});
        }catch(err){};

        lyr.options = obj["options"];
        lyr.vendor  = obj["vendor"];
        lyr.setVisibility(lyr.options.isVisible);
        map.addLayer(lyr);
    }
    else if(obj.vendor.service == "WMS")
    {   var lyr = new OpenLayers.Layer.WMS(obj["title"], obj["url"], obj["params"], obj["options"] );
        //lyr.service = obj.service;
        lyr.vendor  = obj["vendor"];
        lyr.vendor.info_format = "text/html";
        lyr.vendor.feature_count = 1;
        lyr.setVisibility(lyr.options.isVisible);
        map.addLayer(lyr);
    }
}

// ########################################
// delete active layer
// ########################################

function removeAktLayer()
{
    map.removeLayer(map.layers[map.aktLayer]);
    map.aktLayer=0;
}

// ########################################
// utils for random coloring vectors layers
// ########################################

function randomColor(r,g,b, ri,gi,bi, flag)
{
    if(flag==true)
        var randomIdx = parseInt(parseInt((3*15+1)*Math.random()-0.0001) % 3);
    else
        randomIdx=-1;

    var red  = (randomIdx==0) ? parseInt(r - ri*Math.random()) : parseInt(r + ri*Math.random());
    var green= (randomIdx==1) ? parseInt(g - gi*Math.random()) : parseInt(g + gi*Math.random());
    var blue = (randomIdx==2) ? parseInt(b - bi*Math.random()) : parseInt(b + bi*Math.random());

    return("#" + DecToHex(red) + DecToHex(green) + DecToHex(blue));
}

function DecToHex(dec)
{
    var hexStr = "0123456789ABCDEF";
    var low = dec % 16;
    var high = (dec - low)/16;
    hex = "" + hexStr.charAt(high) + hexStr.charAt(low);
    return hex;
}