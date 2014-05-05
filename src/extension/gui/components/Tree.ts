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

/// <reference path="../collections/ITreeCollection.ts"/>
/// <reference path="supportClasses/TreeItemRenderer.ts"/>
/// <reference path="../events/CollectionEvent.ts"/>
/// <reference path="../events/CollectionEventKind.ts"/>
/// <reference path="../events/RendererExistenceEvent.ts"/>
/// <reference path="../events/TreeEvent.ts"/>

module ns_egret {

	export class Tree extends List{
		/**
		 * 构造函数
		 */		
		public constructor(){
			super();
		}
		
		/**
		 * @inheritDoc
		 */
		public createChildren():void{
			if(!this.itemRenderer)
				this.itemRenderer = TreeItemRenderer;
			super.createChildren();
		}
		
		/**
		 * @inheritDoc
		 */
		public get hostComponentKey():any{
			return Tree;
		}
		
		/**
		 * @inheritDoc
		 */
		public updateRenderer(renderer:IItemRenderer, itemIndex:number, data:any):IItemRenderer{
			if(renderer is ITreeItemRenderer&&this.dataProvider is ITreeCollection){
				var treeCollection:ITreeCollection = <ITreeCollection> (this.dataProvider);
				var treeRenderer:ITreeItemRenderer = <ITreeItemRenderer> renderer;
				treeRenderer.hasChildren = treeCollection.hasChildren(data);
				treeRenderer.opened = treeCollection.isItemOpen(data);
				treeRenderer.depth = treeCollection.getDepth(data);
				treeRenderer.iconSkinName = this.itemToIcon(data);
			}
			return super.updateRenderer(renderer, itemIndex, data);
		}
		/**
		 * 根据数据项返回项呈示器中图标的skinName属性值
		 */		
		public itemToIcon(data:any):any{
			if(!data)
				return null;
			
			if(this._iconFunction!=null)
				return this._iconFunction(data);
			
			var skinName:any;
			if(data instanceof XML){
				try{
					if(data[this.iconField].length() != 0){
						skinName = <string> (data[this.iconField]);
					}
				}
				catch(e){
				}
			}
			else if(data instanceof Object){
				try{
					if(data[this.iconField]){
						skinName = data[this.iconField];
					}
				}
				catch(e){
				}
			}
			return skinName;
		}
		
		/**
		 * @inheritDoc
		 */
		public dataGroup_rendererAddHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererAddHandler(event);
			if(event.renderer is ITreeItemRenderer)
				event.renderer.addEventListener(TreeEvent.ITEM_OPENING,this.onItemOpening,this);
		}
		/**
		 * 节点即将打开
		 */		
		private onItemOpening(event:TreeEvent):void{
			var renderer:ITreeItemRenderer = event.itemRenderer;
			var item:any = event.item;
			if(!renderer||!(this.dataProvider is ITreeCollection))
				return;
			if(this.dispatchEvent(event)){
				var opend:boolean = !renderer.opened;
				(<ITreeCollection> (this.dataProvider)).expandItem(item,opend);
				var type:string = opend?TreeEvent.ITEM_OPEN:TreeEvent.ITEM_CLOSE;
				var evt:TreeEvent = new TreeEvent(type,false,false,renderer.itemIndex,item,renderer);
				this.dispatchEvent(evt);
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public dataGroup_rendererRemoveHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererRemoveHandler(event);
			if(event.renderer is ITreeItemRenderer)
				event.renderer.removeEventListener(TreeEvent.ITEM_OPENING,this.onItemOpening,this);
		}
		/**
		 * 图标字段或函数改变标志
		 */		
		private iconFieldOrFunctionChanged:boolean = false;
		
		private _iconField:string;
		/**
		 * 数据项中用来确定图标skinName属性值的字段名称。另请参考UIAsset.skinName。
		 * 若设置了iconFunction，则设置此属性无效。
		 */		
		public get iconField():string{
			return this._iconField;
		}
		public set iconField(value:string){
			if(this._iconField==value)
				return;
			this._iconField = value;
			this.iconFieldOrFunctionChanged = true;
			this.invalidateProperties();
		}
		
		private _iconFunction:Function;
		/**
		 * 用户提供的函数，在每个数据项目上运行以确定其图标的skinName值。另请参考UIAsset.skinName。
		 * 示例：iconFunction(item:Object):Object
		 */		
		public get iconFunction():Function{
			return this._iconFunction;
		}
		public set iconFunction(value:Function){
			if(this._iconFunction==value)
				return;
			this._iconFunction = value;
			this.iconFieldOrFunctionChanged = true;
			this.invalidateProperties();
		}
		/**
		 * 打开或关闭一个节点,注意，此操作不会抛出open或close事件。
		 * @param item 要打开或关闭的节点
		 * @param open true表示打开节点，反之关闭。
		 */		
		public expandItem(item:any,open:boolean = true):void{
			if(!(this.dataProvider is ITreeCollection))
				return;
			(<ITreeCollection> (this.dataProvider)).expandItem(item,open);
		}
		/**
		 * 指定的节点是否打开
		 */		
		public isItemOpen(item:any):boolean{
			if(!(this.dataProvider is ITreeCollection))
				return false;
			return (<ITreeCollection> (this.dataProvider)).isItemOpen(item);
		}
		
		/**
		 * @inheritDoc
		 */
		public dataProvider_collectionChangeHandler(event:CollectionEvent):void{       
			super.dataProvider_collectionChangeHandler(event);
			if(event.kind == CollectionEventKind.OPEN||event.kind == CollectionEventKind.CLOSE){
				var renderer:ITreeItemRenderer = this.dataGroup?
					<ITreeItemRenderer> (this.dataGroup.getElementAt(event.location)):null;
				if(renderer){
					this.updateRenderer(renderer,event.location,event.items[0]);
					if(event.kind == CollectionEventKind.CLOSE&&this.layout&&this.layout.useVirtualLayout){
						this.layout.clearVirtualLayoutCache();
						this.invalidateSize();
					}
				}
			}
		}
		
		public commitProperties():void{
			super.commitProperties();
			if(this.iconFieldOrFunctionChanged){
				if(this.dataGroup!=null){
					var itemIndex:number;
					if(this.layout && this.layout.useVirtualLayout){
						for each (itemIndex in this.dataGroup.getElementIndicesInView()){
							this.updateRendererIconProperty(itemIndex);
						}
					}
					else{
						var n:number = this.dataGroup.numElements;
						for (itemIndex = 0; itemIndex < n; itemIndex++){
							this.updateRendererIconProperty(itemIndex);
						}
					}
				}
				this.iconFieldOrFunctionChanged = false; 
			}
		}
		/**
		 * 更新指定索引项的图标
		 */		
		private updateRendererIconProperty(itemIndex:number):void{
			var renderer:ITreeItemRenderer = <ITreeItemRenderer> (this.dataGroup.getElementAt(itemIndex)); 
			if (renderer)
				renderer.iconSkinName = this.itemToIcon(renderer.data); 
		}
	}
}