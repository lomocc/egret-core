/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/// <reference path="../../../egret/display/DisplayObjectContainer.ts"/>
/// <reference path="../../../egret/events/Event.ts"/>
/// <reference path="../components/Group.ts"/>
/// <reference path="IContainer.ts"/>
/// <reference path="IUIStage.ts"/>
/// <reference path="IVisualElement.ts"/>
/// <reference path="UIGlobals.ts"/>
/// <reference path="UILayer.ts"/>
/// <reference path="../layouts/BasicLayout.ts"/>
/// <reference path="../layouts/supportClasses/LayoutBase.ts"/>

module egret {

	/**
	 * @class egret.UIStage
	 * @classdesc
	 * 系统管理器，应用程序顶级容器。
	 * 通常情况下，一个程序应该只含有唯一的系统管理器,并且所有的组件都包含在它内部。
	 * 它负责管理弹窗，鼠标样式，工具提示的显示层级，以及过滤鼠标和键盘事件为可以取消的。
	 * @extends egret.Group
	 * @implements egret.IUIStage
	 */	
	export class UIStage extends Group implements IUIStage{
		/**
		 * 构造函数
		 * @method egret.UIStage#constructor
		 */		
		public constructor(){
			super();
			this.addEventListener(Event.ADDED_TO_STAGE,this.onAddToStage,this);
			this.addEventListener(Event.REMOVED_FROM_STAGE,this.onRemoveFromStage,this);
		}
		/**
		 * 添加到舞台
		 */		
		private onAddToStage(event:Event=null):void{
            if(UIGlobals._uiStage){
                throw new Error("UIStage是GUI根容器，只能有一个此实例在显示列表中！");
            }
            UIGlobals._uiStage = this;
			this.stage.addEventListener(Event.RESIZE,this.onResize,this);
			this.onResize();
		}
		/**
		 * 从舞台移除
		 */		
		private onRemoveFromStage(event:Event):void{
            UIGlobals._uiStage = null;
			this.stage.removeEventListener(Event.RESIZE,this.onResize,this);
		}
		
		/**
		 * 舞台尺寸改变
		 */		
		private onResize(event:Event=null):void{
			this._setWidth(this.stage.stageWidth);
			this._setHeight(this.stage.stageHeight);
		}

		//==========================================================================
		//                            禁止外部布局顶级容器
		//==========================================================================
		/**
		 * @constant egret.UIStage#x
		 */
        public get x():number{
            return this._x;
        }
		/**
		 * @inheritDoc
		 */
		public set x(value:number){
		}

		/**
		 * @constant egret.UIStage#y
		 */
        public get y():number{
            return this._y;
        }
		/**
		 * @inheritDoc
		 */
		public set y(value:number){
		}

		/**
		 * @member egret.UIStage#width
		 */
        public get width():number{
            return this._width;
        }
		/**
		 * @inheritDoc
		 */
		public set width(value:number){
		}

		/**
		 * @member egret.UIStage#height
		 */
        public get height():number{
            return this._height;
        }
		/**
		 * @inheritDoc
		 */
		public set height(value:number){
		}

		/**
		 * @member egret.UIStage#scaleX
		 */
        public get scaleX():number{
            return this._scaleX;
        }
		/**
		 * @inheritDoc
		 */
		public set scaleX(value:number){
		}

		/**
		 * @member egret.UIStage#scaleY
		 */
        public get scaleY():number{
            return this._scaleY;
        }
		/**
		 * @inheritDoc
		 */
		public set scaleY(value:number){
		}
		/**
		 * @method egret.UIStage#setActualSize
		 * @param w {number} 
		 * @param h {number} 
		 */
		public setActualSize(w:number, h:number):void{
		}
		/**
		 * @method egret.UIStage#setLayoutBoundsPosition
		 * @param x {number} 
		 * @param y {number} 
		 */
		public setLayoutBoundsPosition(x:number, y:number):void{
		}
		/**
		 * @method egret.UIStage#setLayoutBoundsSize
		 * @param layoutWidth {number} 
		 * @param layoutHeight {number} 
		 */
		public setLayoutBoundsSize(layoutWidth:number, layoutHeight:number):void{
		}
		/**
		 * 布局对象,UIStage只接受BasicLayout
		 * @member egret.UIStage#layout
		 */		
		public get layout():LayoutBase{
			return this._layout;
		}
		public set layout(value:LayoutBase){
			if(value instanceof BasicLayout)
				this._setLayout(value);
		}
		
		private _popUpContainer:UILayer;
		/**
		 * 弹出窗口层容器。
		 * @member egret.UIStage#popUpContainer
		 */		
		public get popUpContainer():IContainer{
			if (!this._popUpContainer){
				this._popUpContainer = new UILayer(this,"noTopMostIndex","topMostIndex");
			}
			
			return this._popUpContainer;
		}
		
		private _toolTipContainer:UILayer;
		/**
		 * 工具提示层容器。
		 * @member egret.UIStage#toolTipContainer
		 */		
		public get toolTipContainer():IContainer{
			if (!this._toolTipContainer){
				this._toolTipContainer = new UILayer(this,"topMostIndex","toolTipIndex");
			}
			
			return this._toolTipContainer;
		}
		
		private _cursorContainer:UILayer;
		/**
		 * 鼠标样式层容器。
		 * @member egret.UIStage#cursorContainer
		 */		
		public get cursorContainer():IContainer{
			if (!this._cursorContainer){
				this._cursorContainer = new UILayer(this,"toolTipIndex","cursorIndex");
			}
			
			return this._cursorContainer;
		}
		
		private _noTopMostIndex:number = 0;
		/**
		 * 弹出窗口层的起始索引(包括)
		 */		
		private get noTopMostIndex():number{
			return this._noTopMostIndex;
		}
		
		private set noTopMostIndex(value:number){
			var delta:number = value - this._noTopMostIndex;
			this._noTopMostIndex = value;
			this.topMostIndex += delta;
		}
		
		private _topMostIndex:number = 0;
		/**
		 * 弹出窗口层结束索引(不包括)
		 */		
		private get topMostIndex():number{
			return this._topMostIndex;
		}
		
		private set topMostIndex(value:number){
			var delta:number = value - this._topMostIndex;
			this._topMostIndex = value;
			this.toolTipIndex += delta;
		}
		
		private _toolTipIndex:number = 0;
		/**
		 * 工具提示层结束索引(不包括)
		 */		
		private get toolTipIndex():number{
			return this._toolTipIndex;
		}
		
		private set toolTipIndex(value:number){
			var delta:number = value - this._toolTipIndex;
			this._toolTipIndex = value;
			this.cursorIndex += delta;
		}
		
		private _cursorIndex:number = 0;
		/**
		 * 鼠标样式层结束索引(不包括)
		 */		
		private get cursorIndex():number{
			return this._cursorIndex;
		}
		
		private set cursorIndex(value:number){
			var delta:number = value - this._cursorIndex;
			this._cursorIndex = value;
		}
		
		//==========================================================================
		//                                复写容器操作方法
		//==========================================================================
		/**
		 * @method egret.UIStage#addElement
		 * @param element {IVisualElement} 
		 * @returns {IVisualElement}
		 */
		public addElement(element:IVisualElement):IVisualElement{
			var addIndex:number = this._noTopMostIndex;
			if (element.parent == <DisplayObjectContainer><any>this)
				addIndex--;
			return this.addElementAt(element, addIndex);
		}
		
		/**
		 * @method egret.UIStage#addElementAt
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public addElementAt(element:IVisualElement,index:number):IVisualElement{
			if (element.parent==<DisplayObjectContainer><any>this){
				var oldIndex:number = this.getElementIndex(element);
				if(oldIndex<this._noTopMostIndex)
					this.noTopMostIndex--;
				else if(oldIndex>=this._noTopMostIndex&&oldIndex<this._topMostIndex)
					this.topMostIndex--;
				else if(oldIndex>=this._topMostIndex&&oldIndex<this._toolTipIndex)
					this.toolTipIndex--;
				else 
					this.cursorIndex--;
			}
			
			if(index<=this._noTopMostIndex)
				this.noTopMostIndex++;
			else if(index>this._noTopMostIndex&&index<=this._topMostIndex)
				this.topMostIndex++;
			else if(index>this._topMostIndex&&index<=this._toolTipIndex)
				this.toolTipIndex++;
			else 
				this.cursorIndex++;
			
			return super.addElementAt(element,index);
		}
		
		/**
		 * @method egret.UIStage#removeElement
		 * @param element {IVisualElement} 
		 * @returns {IVisualElement}
		 */
		public removeElement(element:IVisualElement):IVisualElement{
			return this.removeElementAt(super.getElementIndex(element));
		}
		
		/**
		 * @method egret.UIStage#removeElementAt
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public removeElementAt(index:number):IVisualElement{
			var element:IVisualElement = super.removeElementAt(index);
			if(index<this._noTopMostIndex)
				this.noTopMostIndex--;
			else if(index>=this._noTopMostIndex&&index<this._topMostIndex)
				this.topMostIndex--;
			else if(index>=this._topMostIndex&&index<this._toolTipIndex)
				this.toolTipIndex--;
			else 
				this.cursorIndex--;
			return element;
		}
		
		/**
		 * @method egret.UIStage#removeAllElements
		 */
		public removeAllElements():void{
			while(this._noTopMostIndex>0){
				super.removeElementAt(0);
				this.noTopMostIndex--;
			}
		}
		
		/**
		 * @method egret.UIStage#_elementRemoved
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 * @param notifyListeners {boolean} 
		 */
		public _elementRemoved(element:IVisualElement, index:number, notifyListeners:boolean=true):void{
			if(notifyListeners){
				//PopUpManager需要监听这个事件
                Event.dispatchEvent(element,"removeFromUIStage")
			}
			super._elementRemoved(element,index,notifyListeners);
		}
		
		//==========================================================================
		//                                保留容器原始操作方法
		//==========================================================================
		private raw_getElementAt(index:number):IVisualElement{
			return super.getElementAt(index);
		}
		private raw_addElement(element:IVisualElement):IVisualElement{
			var index:number = this.numElements;
			if (element.parent == <DisplayObjectContainer><any>this)
				index--;
			return this.raw_addElementAt(element, index);
		}
		private raw_addElementAt(element:IVisualElement, index:number):IVisualElement{
			if (element.parent==<DisplayObjectContainer><any>this){
				var oldIndex:number = this.getElementIndex(element);
				if(oldIndex<this._noTopMostIndex)
					this.noTopMostIndex--;
				else if(oldIndex>=this._noTopMostIndex&&oldIndex<this._topMostIndex)
					this.topMostIndex--;
				else if(oldIndex>=this._topMostIndex&&oldIndex<this._toolTipIndex)
					this.toolTipIndex--;
				else 
					this.cursorIndex--;
			}
			return super.addElementAt(element,index);
		}
		private raw_removeElement(element:IVisualElement):IVisualElement{
			return super.removeElementAt(super.getElementIndex(element));
		}
		private raw_removeElementAt(index:number):IVisualElement{
			return super.removeElementAt(index);
		}
		private raw_removeAllElements():void{
			while(this.numElements>0){
				super.removeElementAt(0);
			}
		}
		private raw_getElementIndex(element:IVisualElement):number{
			return super.getElementIndex(element);
		}
		private raw_setElementIndex(element:IVisualElement, index:number):void{
			super.setElementIndex(element,index);
		}
		private raw_swapElements(element1:IVisualElement, element2:IVisualElement):void{
			super.swapElementsAt(super.getElementIndex(element1), super.getElementIndex(element2));
		}
		private raw_swapElementsAt(index1:number, index2:number):void{
			super.swapElementsAt(index1,index2);
		}
	}
}