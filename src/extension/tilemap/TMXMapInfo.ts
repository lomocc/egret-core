/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/// <reference path="TMXTileMap.ts"/>
/// <reference path="TMXConst.ts"/>
/// <reference path="../../egret/core/Logger.ts"/>
/// <reference path="../../egret/resource/ResourceLoader.ts"/>
/// <reference path="../../egret/utils/SAXParser.ts"/>
module ns_egret {
    export class TMXMapInfo {
        private _orientation = null;
        private _mapWidth:number = null;
        private _mapHeight:number = null;
        private _tileWidth:number = null;
        private _tileHeight:number = null;
        private _layers:Array = null;
        private _tileSets:Array = null;
        private _objectGroups:Array = null;
        private _parentGID:number = null;
        private _storingCharacters = false;
        private _properties:Array = null;
        private _TMXFileName:string = null;
        private  _currentString:string = null;
        private _tileProperties:Array = null;

        static createWithFile(tmxFile:string) {
            var ret:TMXMapInfo = new TMXMapInfo();
            ret.initWithTMXFile(tmxFile);
            return ret;
        }

        public initWithTMXFile(tmxFile) {
            this.internalInit(tmxFile);
            this.parseXMXFile(this._TMXFileName);
        }

        private internalInit(tmxFileName) {
            this._tileSets = [];
            this._layers = [];
            this._TMXFileName = tmxFileName;
            this._objectGroups = [];
            this._properties = [];
            this._tileProperties = [];

            this._currentString = "";
            this._storingCharacters = false;
        }

        private parseXMXFile(tmxFile:string) {
            var xml = ResourceLoader.create(tmxFile).data;
            if (xml == null) {
                ns_egret.Logger.fatal("tmx文件没有加载：" + tmxFile);
            }
            var mapXML = SAXParser.getInstance().tmxParse(xml, true);
            var i, j;
            //解析地图信息
            var map = mapXML.documentElement;
            var version = map.getAttribute('version');
            var orientationStr = map.getAttribute('orientation');

            if (map.nodeName == "map") {
                if (orientationStr == "orthogonal")
                    this.setOrientation(ns_egret.TMX.ORIENTATION_ORTHO);
                else if (orientationStr == "isometric")
                    this.setOrientation(ns_egret.TMX.ORIENTATION_ISO);
                else if (orientationStr == "hexagonal")
                    this.setOrientation(ns_egret.TMX.ORIENTATION_HEX);
                else if (orientationStr !== null)
                    ns_egret.Logger.info("TMXFomat: Unsupported orientation:" + this.getOrientation());

                this._mapWidth = parseFloat(map.getAttribute('width'));
                this._mapHeight = parseFloat(map.getAttribute('height'));

                this._tileWidth = parseFloat(map.getAttribute('tilewidth'));
                this._tileHeight = parseFloat(map.getAttribute('tileheight'));

                var propertyArr = map.querySelectorAll("map > properties >  property");
                if (propertyArr) {
                    var aPropertyDict = {};
                    for (i = 0; i < propertyArr.length; i++) {
                        aPropertyDict[propertyArr[i].getAttribute('name')] = propertyArr[i].getAttribute('value');
                    }
                    this.setProperties(aPropertyDict);
                }
            }

            //解析tileset
            var tilesets = map.getElementsByTagName('tileset');
            if (map.nodeName !== "map") {
                tilesets = [];
                tilesets.push(map);
            }

            for (i = 0; i < tilesets.length; i++) {
                var selTileset = tilesets[i];
                var externalTilesetFilename = selTileset.getAttribute('source');
                if (externalTilesetFilename) {
                    this.parseXMLFile(externalTilesetFilename);
                } else {
                    var tileset:TMXTilesetInfo = new TMXTilesetInfo();
                    tileset.name = selTileset.getAttribute('name') || "";
                    tileset.firstGid = parseInt(selTileset.getAttribute('firstgid')) || 0;

                    tileset.spacing = parseInt(selTileset.getAttribute('spacing')) || 0;
                    tileset.margin = parseInt(selTileset.getAttribute('margin')) || 0;

                    tileset.tileWidth = parseFloat(selTileset.getAttribute('tilewidth'));
                    tileset.tileHeight = parseFloat(selTileset.getAttribute('tileheight'));

                    var image = selTileset.getElementsByTagName('image')[0];
                    var imagename = image.getAttribute('source');
                    var num = -1;
                    if (this._TMXFileName) {
                        num = this._TMXFileName.lastIndexOf("/");
                    }
                    if (num !== -1) {
                        var dir = this._TMXFileName.substr(0, num + 1);
                        tileset.sourceImage = dir + imagename;
                    } else {
                        tileset.sourceImage = imagename;
                    }
                    this.setTilesets(tileset);
                }
            }

            //解析tile
            var tiles = map.querySelectorAll('tile');
            if (tiles) {
                for (i = 0; i < tiles.length; i++) {
                    var info = this._tileSets[0];
                    var t = tiles[i];
                    this.setParentGID(parseInt(info.firstGid) + parseInt(t.getAttribute('id') || 0));
                    var tp = t.querySelectorAll("properties > property");
                    if (tp) {
                        var dict = {};
                        for (j = 0; j < tp.length; j++) {
                            var name = tp[j].getAttribute('name');
                            var value = tp[j].getAttribute('value');
                            dict[name] = value;
                        }
                        this._tileProperties[this.getParentGID()] = dict;
                    }
                }
            }

            //解析layer
            var layers = map.getElementsByTagName('layer');
            if (layers) {
                for (i = 0; i < layers.length; i++) {
                    var selLayer = layers[i];
                    var data = selLayer.getElementsByTagName('data')[0];

                    var layer:TMXLayerInfo = new TMXLayerInfo();
                    layer.name = selLayer.getAttribute('name');

                    layer.layerWidth = parseFloat(selLayer.getAttribute('width'));
                    layer.layerHeight = parseFloat(selLayer.getAttribute('height'));

                    var visible = selLayer.getAttribute('visible');
                    layer.visible = !(visible == "0");

                    var opacity = selLayer.getAttribute('opacity') || 1;
                    if (opacity) {
                        layer.opacity = parseFloat(opacity);
                    }
                    else {
                        layer.opacity = 1;
                    }

                    layer.layerX = parseFloat(selLayer.getAttribute('x')) || 0;
                    layer.layerY = parseFloat(selLayer.getAttribute('y')) || 0;

                    var nodeValue = '';
                    for (j = 0; j < data.childNodes.length; j++) {
                        nodeValue += data.childNodes[j].nodeValue
                    }
                    nodeValue = nodeValue.trim();

                    //解压缩tilemap data
                    var compression = data.getAttribute('compression');
                    var encoding = data.getAttribute('encoding');
                    if (compression && compression !== "gzip" && compression !== "zlib") {
                        ns_egret.Logger.fatal("TMXMapInfo.parseXMLFile(): unsupported compression method");
                        return null;
                    }
                    switch (compression) {
                        case 'gzip':
                            layer._tiles = ns_egret.Utils.unzipBase64AsArray(nodeValue, 4);
                            break;
                        case 'zlib':
                            var inflator = new Zlib.Inflate(ns_egret.Codec.Base64.decodeAsArray(nodeValue, 1));
                            layer._tiles = ns_egret.Utils.uint8ArrayToUint32Array(inflator.decompress());
                            break;
                        case null:
                        case '':
                            if (encoding == "base64") {
                                layer._tiles = ns_egret.Codec.Base64.decodeAsArray(nodeValue, 4);
                            }
                            else if (encoding === "csv") {
                                layer._tiles = [];
                                var csvTiles = nodeValue.split(',');
                                for (var csvIdx = 0; csvIdx < csvTiles.length; csvIdx++) {
                                    layer._tiles.push(parseInt(csvTiles[csvIdx]));
                                }
                            } else {
                                var selDataTiles = data.getElementsByTagName("tile");
                                layer._tiles = [];
                                for (var xmlIdx = 0; xmlIdx < selDataTiles.length; xmlIdx++) {
                                    layer._tiles.push(parseInt(selDataTiles[xmlIdx].getAttribute("gid")));
                                }
                            }
                            break;
                        default:
                            ns_egret.Logger.info("TMXMapInfo.parseXMLFile(): Only base64 and/or gzip/zlib maps are supported");
                            break;
                    }

                    var layerProps = selLayer.querySelectorAll("properties > property");
                    if (layerProps) {
                        var layerProp = {};
                        for (j = 0; j < layerProps.length; j++) {
                            layerProp[layerProps[j].getAttribute('name')] = layerProps[j].getAttribute('value');
                        }
                        layer.setProperties(layerProp);
                    }
                    this.setLayers(layer);
                }
            }

            //解析objectgroup
            var objectGroups = map.getElementsByTagName('objectgroup');
            if (objectGroups) {
                for (i = 0; i < objectGroups.length; i++) {
                    var selGroup = objectGroups[i];
                    var objectGroup:TMXObjectGroup = new TMXObjectGroup();
                    objectGroup.setGroupName(selGroup.getAttribute('name'));
                    objectGroup.setPositionOffsetX(parseFloat(selGroup.getAttribute('x')) * this._tileWidth || 0);
                    objectGroup.setPositionOffsetY(parseFloat(selGroup.getAttribute('y')) * this._tileHeight || 0);

                    var groupProps = selGroup.querySelectorAll("objectgroup > properties > property");
                    if (groupProps) {
                        for (j = 0; j < groupProps.length; j++) {
                            var groupProp = {};
                            groupProp[groupProps[j].getAttribute('name')] = groupProps[j].getAttribute('value');
                            objectGroup.setProperties(groupProp);
                        }
                    }

                    var objects = selGroup.querySelectorAll('object');
                    if (objects) {
                        for (j = 0; j < objects.length; j++) {
                            var selObj = objects[j];
                            var objectProp = {};
                            objectProp["name"] = selObj.getAttribute('name') || "";
                            objectProp["type"] = selObj.getAttribute('type') || "";

                            objectProp["x"] = parseInt(selObj.getAttribute('x') || 0) + objectGroup.getPositionOffsetX();
                            var y = parseInt(selObj.getAttribute('y') || 0) + objectGroup.getPositionOffsetY();
                            objectProp["y"] = Math.floor(this._mapHeight * this._tileHeight) - y - objectProp["height"];

                            objectProp["width"] = parseInt(selObj.getAttribute('width')) || 0;
                            objectProp["height"] = parseInt(selObj.getAttribute('height')) || 0;

                            var docObjProps = selObj.querySelectorAll("properties > property");
                            if (docObjProps) {
                                for (var k = 0; k < docObjProps.length; k++) {
                                    objectProp[docObjProps[k].getAttribute('name')] = docObjProps[k].getAttribute('value');
                                }
                            }
                            //polygon
                            var polygonProps = selObj.querySelectorAll("polygon");
                            if (polygonProps && polygonProps.length > 0) {
                                var selPgPointStr = polygonProps[0].getAttribute('points');
                                if (selPgPointStr) {
                                    objectProp["polygonPoints"] = this.parsePointsString(selPgPointStr);
                                }
                            }
                            //polyline
                            var polylineProps = selObj.querySelectorAll("polyline");
                            if (polylineProps && polylineProps.length > 0) {
                                var selPlPointStr = polylineProps[0].getAttribute('points');
                                if (selPlPointStr) {
                                    objectProp["polylinePoints"] = this.parsePointsString(selPlPointStr);
                                }
                            }
                            objectGroup.addObject(objectProp);
                        }
                    }
                    this.setObjectGroups(objectGroup);
                }
            }
            return map;
        }

        private parsePointsString(pointsString) {
            if (!pointsString) {
                return null;
            }
            var points = [];
            var pointsStr = pointsString.split(' ');
            for (var i = 0; i < pointsStr.length; i++) {
                var selPointStr = pointsStr[i].split(',');
                points.push({'x': selPointStr[0], 'y': selPointStr[1]});
            }
            return points;
        }

        public getOrientation() {
            return this._orientation;
        }

        public setOrientation(value) {
            this._orientation = value;
        }

        public getProperties() {
            return this._properties;
        }

        public setProperties(value) {
            this._properties = value;
        }

        public getTilesets() {
            return this._tileSets;
        }

        public setTilesets(value) {
            this._tileSets.push(value);
        }

        public getParentGID():number {
            return this._parentGID;
        }

        public setParentGID(value) {
            this._parentGID = value;
        }

        public getLayers() {
            return this._layers;
        }

        public setLayers(value) {
            this._layers.push(value);
        }

        public getObjectGroups() {
            return this._objectGroups;
        }

        public setObjectGroups(value) {
            this._objectGroups.push(value);
        }

        public getTileProperties() {
            return this._tileProperties;
        }

        public setTileProperties(value) {
            this._tileProperties.push(value);
        }

        public getTileWidth():number {
            return this._tileWidth;
        }

        public getTileHeight():number {
            return this._tileHeight;
        }

        public getMapWidth():number {
            return this._mapWidth;
        }

        public getMapHeight():number {
            return this._mapHeight;
        }
    }


    export class TMXTilesetInfo {
        public name:string = "";
        public firstGid;
        //间距
        public spacing:number;
        public margin;
        public tileWidth:number;
        public tileHeight:number;
        public sourceImage:string;
        public imageWidth:number;
        public imageHeight:number;

        rectForGID(gid):Point {
            var rect = Point.identity;
            gid &= ns_egret.TMX.TILE_FLIPPED_MASK;
            gid = gid - parseInt(this.firstGid, 10);
            var max_x = Math.floor((this.imageWidth - this.margin * 2 + this.spacing) / (this.tileWidth + this.spacing));
            rect.x = parseInt((gid % max_x) * (this.tileWidth + this.spacing) + this.margin, 10);
            rect.y = parseInt(Math.floor(gid / max_x) * (this.tileHeight + this.spacing) + this.margin, 10);
            return rect;
        }
    }


    export class TMXObjectGroup {
        private _groupName:string;
        private _positionOffsetX:number;
        private _positionOffsetY:number;
        private _properties = [];
        private _objects = [];

        public getGroupName() {
            return this._groupName;
        }

        public setGroupName(value:string) {
            this._groupName = value;
        }

        public getPositionOffsetX() {
            return this._positionOffsetX;
        }

        public setPositionOffsetX(value) {
            this._positionOffsetX = value;
        }

        public getPositionOffsetY() {
            return this._positionOffsetY;
        }

        public setPositionOffsetY(value) {
            this._positionOffsetY = value;
        }

        public getProperties() {
            return this._properties;
        }

        public setProperties(value) {
            this._properties.push(value);
        }

        public getObjects() {
            return this._objects;
        }

        public addObject(value) {
            this._objects.push(value);
        }
    }


    export class TMXLayerInfo {
        public name:string;
        public layerWidth:number;
        public layerHeight:number;
        public visible:Boolean;
        public opacity:number;
        public _tiles;
        public layerX:number;
        public layerY:number;
        public ownTiles;
        public _minGID:number = 100000;
        public _maxGID:number = 0;
        private _properties;

        public getProperties() {
            return this._properties;
        }

        public setProperties(value) {
            this._properties = value;
        }
    }
}