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
/// <reference path="../../egret/display/DisplayObjectContainer.ts"/>
/// <reference path="TMXMapInfo.ts"/>
/// <reference path="TMXLayer.ts"/>
/// <reference path="TMXConst.ts"/>
/// <reference path="../../egret/core/Logger.ts"/>
module ns_egret {
    export class TMXTiledMap extends DisplayObjectContainer {

        public mapInfo:ns_egret.TMXMapInfo;
        public viewPortWidth:number = 400;

        public static createWithFile(tmxFile:string):TMXTiledMap {
            var ret:TMXTiledMap = new TMXTiledMap();
            ret.initWithTMXFile(tmxFile);
            return ret;
        }

        public initWithTMXFile(tmxFile:string) {
            if (!tmxFile || tmxFile.length == 0) {
                ns_egret.Logger.fatal("TMXTiledMap.initWithTMXFile(): tmxFile应该是不为null的string");
            }
            var mapInfo:TMXMapInfo = TMXMapInfo.createWithFile(tmxFile);
            if (!mapInfo) {
                return;
            }

            var locTilesets:Array = mapInfo.getTilesets();
            if (!locTilesets || locTilesets.length === 0) {
                ns_egret.Logger.info("TMXTiledMap.initWithTMXFile(): Map没有", tmxFile);
            }
            this.buildWithMapInfo(mapInfo);
        }

        private buildWithMapInfo(mapInfo:TMXMapInfo) {
            this.mapInfo = mapInfo;
            var idx = 0;
            var layers:Array = mapInfo.getLayers();
            if (layers) {
                var layerInfo:ns_egret.TMXLayerInfo = null;
                for (var i = 0, len = layers.length; i < len; i++) {
                    layerInfo = layers[i];
                    if (layerInfo && layerInfo.visible) {
                        var child = this.parseLayer(layerInfo, mapInfo);
                        super.addChild(child, idx);
                        idx++;
                    }
                }
            }
        }

        private parseLayer(layerInfo:TMXLayerInfo, mapInfo:TMXMapInfo) {
            var tileset:TMXTilesetInfo = this.tilesetForLayer(layerInfo, mapInfo);
            var layer = TMXLayer.create(tileset, layerInfo, mapInfo);
            layerInfo.ownTiles = false;
            layer.setupTiles();
            return layer;
        }

        private tilesetForLayer(layerInfo:TMXLayerInfo, mapInfo:TMXMapInfo) {
            var layerWidth = layerInfo.layerWidth;
            var layerHeight = layerInfo.layerHeight;
            var tilesets:Array = mapInfo.getTilesets();
            if (tilesets) {
                for (var i = tilesets.length - 1; i >= 0; i--) {
                    var tileset:TMXTilesetInfo = tilesets[i];
                    if (tileset) {
                        for (var y = 0; y < layerHeight; y++) {
                            for (var x = 0; x < layerWidth; x++) {
                                var pos = x + layerWidth * y;
                                var gid = layerInfo._tiles[pos];
                                if (gid != 0) {
                                    if (((gid & ns_egret.TMX.TILE_FLIPPED_MASK) >>> 0) >= tileset.firstGid) {
                                        return tileset;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            ns_egret.Logger.warning("TMXLayer" + layerInfo.name + "没有tiles");
            return null;
        }

        public getLayer(layerName:string) {
            if (!layerName || layerName.length === 0) {
                ns_egret.Logger.fatal("TMXTiledMap.getLayer(): layerName应该是不为null的string");
            }
            var l = this.numChildren;
            for (var i = 0; i < l; i++) {
                var layer = super.getChildAt(i);
                if (layer && layer.getLayerName && layer.getLayerName() == layerName)
                    return layer;
            }
            return null;
        }

        public getObjectGroup(groupName:string) {
            if (!groupName || groupName.length === 0)
                ns_egret.Logger.fatal("TMXTiledMap.getObjectGroup(): groupName应该是不为null的string");
            var groups = this.mapInfo.getObjectGroups;
            if (groups) {
                for (var i = 0, len = groups.length; i < len; i++) {
                    var objectGroup = groups[i];
                    if (objectGroup && objectGroup.getGroupName() == groupName) {
                        return objectGroup;
                    }
                }
            }
            return null;
        }

        public propertiesForGID(value) {
            return this.mapInfo.getTileProperties()[value];
        }

        public getProperty(propertyName) {
            return this.mapInfo.getProperties()[propertyName.toString()];
        }

        public setMoveX(x:number) {
            this.x = x;
            var l = this.numChildren;
            for (var i:number = 0; i < l; i++) {
                var layer = this.getChildAt(i);
                if (layer instanceof TMXLayer) {
                    if(layer.visible)
                    {
                        for (var j:number = 0; j < layer.numChildren; j++) {
                            var tile = layer.getChildAt(j);
                            //格子只按地图尺寸进行计算，不考虑锚点、缩放等
                            if(tile.x + this.mapInfo.getTileWidth() < -this.x || tile.x > -this.x + this.viewPortWidth)
                            {
                                tile.visible = false;
                            }
                            else
                            {
                                tile.visible = true;
                            }
                        }
                    }
                }
                else{
                    var bounds = layer.getBounds();
                    if(layer.x + bounds.width - layer.anchorPointX < -this.x || layer.x - layer.anchorPointX > -this.x + this.viewPortWidth){
                        layer.visible = false;
                    }
                    else
                    {
                        layer.visible = true;
                    }
                }
            }
        }
    }
}