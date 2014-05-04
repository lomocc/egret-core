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

/// <reference path="../../../egret/core/HorizontalAlign.ts"/>
/// <reference path="../../../egret/core/VerticalAlign.ts"/>
/// <reference path="../../../egret/events/Event.ts"/>
/// <reference path="../../../egret/geom/Rectangle.ts"/>
/// <reference path="../core/ILayoutElement.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="supportClasses/LayoutBase.ts"/>

module ns_egret {

	export class HorizontalLayout extends LayoutBase{
		public constructor(){
			super();
		}
		
		private _horizontalAlign:string = HorizontalAlign.LEFT;
		/**
		 * 布局元素的水平对齐策略。参考HorizontalAlign定义的常量。
		 * 注意：此属性设置为CONTENT_JUSTIFY始终无效。当useVirtualLayout为true时，设置JUSTIFY也无效。
		 */
		public get horizontalAlign():string{
			return this._horizontalAlign;
		}
		
		public set horizontalAlign(value:string){
			if(this._horizontalAlign==value)
				return;
			this._horizontalAlign = value;
			if(this.target)
				this.target.invalidateDisplayList();
		}
		
		private _verticalAlign:string = VerticalAlign.TOP;
		/**
		 * 布局元素的竖直对齐策略。参考VerticalAlign定义的常量。
		 */
		public get verticalAlign():string{
			return this._verticalAlign;
		}
		
		public set verticalAlign(value:string){
			if(this._verticalAlign==value)
				return;
			this._verticalAlign = value;
			if(this.target)
				this.target.invalidateDisplayList();
		}
		
		private _gap:number = 6;
		/**
		 * 布局元素之间的水平空间（以像素为单位）
		 */
		public get gap():number{
			return this._gap;
		}

		public set gap(value:number){
			if (this._gap == value) 
				return;
			this._gap = value;
			this.invalidateTargetSizeAndDisplayList();
			if(this.hasEventListener("gapChanged"))
				this.dispatchEvent(new Event("gapChanged"));
		}
		
		private _padding:number = 0;
		/**
		 * 四个边缘的共同内边距。若单独设置了任一边缘的内边距，则该边缘的内边距以单独设置的值为准。
		 * 此属性主要用于快速设置多个边缘的相同内边距。默认值：0。
		 */
		public get padding():number{
			return this._padding;
		}
		public set padding(value:number){
			if(this._padding==value)
				return;
			this._padding = value;
			this.invalidateTargetSizeAndDisplayList();
		}

		
		private _paddingLeft:number = NaN;
		/**
		 * 容器的左边缘与布局元素的左边缘之间的最少像素数,若为NaN将使用padding的值，默认值：NaN。
		 */
		public get paddingLeft():number{
			return this._paddingLeft;
		}
		
		public set paddingLeft(value:number){
			if (this._paddingLeft == value)
				return;
			
			this._paddingLeft = value;
			this.invalidateTargetSizeAndDisplayList();
		}    
		
		private _paddingRight:number = NaN;
		/**
		 * 容器的右边缘与布局元素的右边缘之间的最少像素数,若为NaN将使用padding的值，默认值：NaN。
		 */
		public get paddingRight():number{
			return this._paddingRight;
		}
		
		public set paddingRight(value:number){
			if (this._paddingRight == value)
				return;
			
			this._paddingRight = value;
			this.invalidateTargetSizeAndDisplayList();
		}    
		
		private _paddingTop:number = NaN;
		/**
		 * 容器的顶边缘与第一个布局元素的顶边缘之间的像素数,若为NaN将使用padding的值，默认值：NaN。
		 */
		public get paddingTop():number{
			return this._paddingTop;
		}
		
		public set paddingTop(value:number){
			if (this._paddingTop == value)
				return;
			
			this._paddingTop = value;
			this.invalidateTargetSizeAndDisplayList();
		}    
		
		private _paddingBottom:number = NaN;
		/**
		 * 容器的底边缘与最后一个布局元素的底边缘之间的像素数,若为NaN将使用padding的值，默认值：NaN。
		 */
		public get paddingBottom():number{
			return this._paddingBottom;
		}
		
		public set paddingBottom(value:number){
			if (this._paddingBottom == value)
				return;
			
			this._paddingBottom = value;
			this.invalidateTargetSizeAndDisplayList();
		}    
		
		/**
		 * 标记目标容器的尺寸和显示列表失效
		 */		
		private invalidateTargetSizeAndDisplayList():void{
			if(this.target){
				this.target.invalidateSize();
				this.target.invalidateDisplayList();
			}
		}

		/**
		 * @inheritDoc
		 */
		public measure():void{
			super.measure();
			if(!this.target)
				return;
			if(this.useVirtualLayout){
				this.measureVirtual();
			}
			else{
				this.measureReal();
			}
		}
		
		/**
		 * 测量使用虚拟布局的尺寸
		 */		
		private measureVirtual():void{
			var numElements:number = this.target.numElements;
			var typicalHeight:number = this.typicalLayoutRect?this.typicalLayoutRect.height:22;
			var typicalWidth:number = this.typicalLayoutRect?this.typicalLayoutRect.width:71;
			var measuredWidth:number = this.getElementTotalSize();
			var measuredHeight:number = Math.max(this.maxElementHeight,typicalHeight);
			
			var visibleIndices:Array = this.target.getElementIndicesInView();
            var length:number = visibleIndices.length;
			for(var i:number=0;i<length;i++){
                var index:number = visibleIndices[i];
				var layoutElement:ILayoutElement = <ILayoutElement> (this.target.getElementAt(index));
				if (layoutElement == null||!layoutElement.includeInLayout)
					continue;
				
				var preferredWidth:number = layoutElement.preferredWidth;
				var preferredHeight:number = layoutElement.preferredHeight;
				measuredWidth += preferredWidth;
				measuredWidth -= isNaN(this.elementSizeTable[index])?typicalWidth:this.elementSizeTable[index];
				measuredHeight = Math.max(measuredHeight,preferredHeight);
			}
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var paddingT:number = isNaN(this._paddingTop)?padding:this._paddingTop;
			var paddingB:number = isNaN(this._paddingBottom)?padding:this._paddingBottom;
			
			var hPadding:number = paddingL + paddingR;
			var vPadding:number = paddingT + paddingB;
			this.target.measuredWidth = Math.ceil(measuredWidth+hPadding);
			this.target.measuredHeight = Math.ceil(measuredHeight+vPadding);
		}
		
		/**
		 * 测量使用真实布局的尺寸
		 */		
		private measureReal():void{
			var count:number = this.target.numElements;
			var numElements:number = count;
			var measuredWidth:number = 0;
			var measuredHeight:number = 0;
			for (var i:number = 0; i < count; i++){
				var layoutElement:ILayoutElement = <ILayoutElement> (this.target.getElementAt(i));
				if (!layoutElement||!layoutElement.includeInLayout){
					numElements--;
					continue;
				}
				var preferredWidth:number = layoutElement.preferredWidth;
				var preferredHeight:number = layoutElement.preferredHeight;
				measuredWidth += preferredWidth;
				measuredHeight = Math.max(measuredHeight,preferredHeight);
			}
			var gap:number = isNaN(this._gap)?0:this._gap;
			measuredWidth += (numElements-1)*gap;
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var paddingT:number = isNaN(this._paddingTop)?padding:this._paddingTop;
			var paddingB:number = isNaN(this._paddingBottom)?padding:this._paddingBottom;
			var hPadding:number = paddingL + paddingR;
			var vPadding:number = paddingT + paddingB;
			this.target.measuredWidth = Math.ceil(measuredWidth+hPadding);
			this.target.measuredHeight = Math.ceil(measuredHeight+vPadding);
		}
		
		/**
		 * @inheritDoc
		 */
		public updateDisplayList(width:number, height:number):void{
			super.updateDisplayList(width, height);
			if(!this.target)
				return;
			if(this.useVirtualLayout){
				this.updateDisplayListVirtual(width,height);
			}
			else{
				this.updateDisplayListReal(width,height);
			}
		}
		
		
		/**
		 * 虚拟布局使用的子对象尺寸缓存 
		 */		
		private elementSizeTable:Array = [];
		
		/**
		 * 获取指定索引的起始位置
		 */		
		private getStartPosition(index:number):number{
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var gap:number = isNaN(this._gap)?0:this._gap;
			if(!this.useVirtualLayout){
				var element:IVisualElement;
				if(this.target){
					element = this.target.getElementAt(index);
				}
				return element?element.x:paddingL;
			}
			var typicalWidth:number = this.typicalLayoutRect?this.typicalLayoutRect.width:71;
			var startPos:number = paddingL;
			for(var i:number = 0;i<index;i++){
				var eltWidth:number = this.elementSizeTable[i];
				if(isNaN(eltWidth)){
					eltWidth = typicalWidth;
				}
				startPos += eltWidth+gap;
			}
			return startPos;
		}
		
		/**
		 * 获取指定索引的元素尺寸
		 */		
		private getElementSize(index:number):number{
			if(this.useVirtualLayout){
				var size:number = this.elementSizeTable[index];
				if(isNaN(size)){
					size = this.typicalLayoutRect?this.typicalLayoutRect.width:71;
				}
				return size;
			}
			if(this.target){
				return this.target.getElementAt(index).width;
			}
			return 0;
		}
		
		/**
		 * 获取缓存的子对象尺寸总和
		 */		
		private getElementTotalSize():number{
			var typicalWidth:number = this.typicalLayoutRect?this.typicalLayoutRect.width:71;
			var gap:number = isNaN(this._gap)?0:this._gap;
			var totalSize:number = 0;
			var length:number = this.target.numElements;
			for(var i:number = 0; i<length; i++){
				var eltWidth:number = this.elementSizeTable[i];
				if(isNaN(eltWidth)){
					eltWidth = typicalWidth;
				}
				totalSize += eltWidth+gap;
			}
			totalSize -= gap;
			return totalSize;
		}
		
		/**
		 * @inheritDoc
		 */
		public elementAdded(index:number):void{
			if(!this.useVirtualLayout)
				return;
			super.elementAdded(index);
			var typicalWidth:number = this.typicalLayoutRect?this.typicalLayoutRect.width:71;
			this.elementSizeTable.splice(index,0,typicalWidth);
		}
		
		/**
		 * @inheritDoc
		 */
		public elementRemoved(index:number):void{
			if(!this.useVirtualLayout)
				return;
			super.elementRemoved(index);
			this.elementSizeTable.splice(index,1);
		}
		
		/**
		 * @inheritDoc
		 */
		public clearVirtualLayoutCache():void{
			if(!this.useVirtualLayout)
				return;
			super.clearVirtualLayoutCache();
			this.elementSizeTable = [];
			this.maxElementHeight = 0;
		}
		
		
		
		/**
		 * 折半查找法寻找指定位置的显示对象索引
		 */		
		private findIndexAt(x:number, i0:number, i1:number):number{
			var index:number = (i0 + i1) / 2;
			var elementX:number = this.getStartPosition(index);
			var elementWidth:number = this.getElementSize(index);
			var gap:number = isNaN(this._gap)?0:this._gap;
			if ((x >= elementX) && (x < elementX + elementWidth + gap))
				return index;
			else if (i0 == i1)
				return -1;
			else if (x < elementX)
				return this.findIndexAt(x, i0, Math.max(i0, index-1));
			else 
				return this.findIndexAt(x, Math.min(index+1, i1), i1);
		} 
		
		/**
		 * 虚拟布局使用的当前视图中的第一个元素索引
		 */		
		private startIndex:number = -1;
		/**
		 * 虚拟布局使用的当前视图中的最后一个元素的索引
		 */		
		private endIndex:number = -1;
		/**
		 * 视图的第一个和最后一个元素的索引值已经计算好的标志 
		 */		
		private indexInViewCalculated:boolean = false;
		
		/**
		 * @inheritDoc
		 */
		public scrollPositionChanged():void{
			super.scrollPositionChanged();
			if(this.useVirtualLayout){
				var changed:boolean = this.getIndexInView();
				if(changed){
					this.indexInViewCalculated = true;
					this.target.invalidateDisplayList();
				}
			}
			
		}
		
		/**
		 * 获取视图中第一个和最后一个元素的索引,返回是否发生改变
		 */		
		private getIndexInView():boolean{
			if(!this.target||this.target.numElements==0){
				this.startIndex = this.endIndex = -1;
				return false;
			}
			
			if(isNaN(this.target.width)||this.target.width==0||isNaN(this.target.height)||this.target.height==0){
				this.startIndex = this.endIndex = -1;
				return false;
			}
			
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var paddingT:number = isNaN(this._paddingTop)?padding:this._paddingTop;
			var paddingB:number = isNaN(this._paddingBottom)?padding:this._paddingBottom;
			
			var numElements:number = this.target.numElements;
			var contentWidth:number = this.getStartPosition(numElements-1)+
				this.elementSizeTable[numElements-1]+paddingR;			
			var minVisibleX:number = this.target.horizontalScrollPosition;
			if(minVisibleX>contentWidth-paddingR){
				this.startIndex = -1;
				this.endIndex = -1;
				return false;
			}
			var maxVisibleX:number = this.target.horizontalScrollPosition + this.target.width;
			if(maxVisibleX<paddingL){
				this.startIndex = -1;
				this.endIndex = -1;
				return false;
			}
			var oldStartIndex:number = this.startIndex;
			var oldEndIndex:number = this.endIndex;
			this.startIndex = this.findIndexAt(minVisibleX,0,numElements-1);
			if(this.startIndex==-1)
				this.startIndex = 0;
			this.endIndex = this.findIndexAt(maxVisibleX,0,numElements-1);
			if(this.endIndex == -1)
				this.endIndex = numElements-1;
			return oldStartIndex!=this.startIndex||oldEndIndex!=this.endIndex;
		}
		
		/**
		 * 子对象最大宽度 
		 */		
		private maxElementHeight:number = 0;
		
		/**
		 * 更新使用虚拟布局的显示列表
		 */		
		private updateDisplayListVirtual(width:number,height:number):void{
			if(this.indexInViewCalculated)
				this.indexInViewCalculated = false;
			else
				this.getIndexInView();
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var paddingT:number = isNaN(this._paddingTop)?padding:this._paddingTop;
			var paddingB:number = isNaN(this._paddingBottom)?padding:this._paddingBottom;
			var gap:number = isNaN(this._gap)?0:this._gap;
			var contentWidth:number;
			var numElements:number = this.target.numElements;
			if(this.startIndex == -1||this.endIndex==-1){
				contentWidth = this.getStartPosition(numElements)-gap+paddingR;
				this.target.setContentSize(Math.ceil(contentWidth),this.target.contentHeight);
				return;
			}
			this.target.setVirtualElementIndicesInView(this.startIndex,this.endIndex);
			//获取垂直布局参数
			var justify:boolean = this._verticalAlign==VerticalAlign.JUSTIFY||this._verticalAlign==VerticalAlign.CONTENT_JUSTIFY;
			var contentJustify:boolean = this._verticalAlign==VerticalAlign.CONTENT_JUSTIFY;
			var vAlign:number = 0;
			if(!justify){
				if(this._verticalAlign==VerticalAlign.MIDDLE){
					vAlign = 0.5;
				}
				else if(this._verticalAlign==VerticalAlign.BOTTOM){
					vAlign = 1;
				}
			}
			
			var targetHeight:number = Math.max(0, height - paddingT - paddingB);
			var justifyHeight:number = Math.ceil(targetHeight);
			var layoutElement:ILayoutElement;
			var typicalHeight:number = this.typicalLayoutRect?this.typicalLayoutRect.height:22;
			var typicalWidth:number = this.typicalLayoutRect?this.typicalLayoutRect.width:71;
			var oldMaxH:number = Math.max(typicalHeight,this.maxElementHeight);
			if(contentJustify){
				for(var index:number=this.startIndex;index<=this.endIndex;index++){
					layoutElement = <ILayoutElement> (this.target.getVirtualElementAt(index));
					if (!layoutElement||!layoutElement.includeInLayout)
						continue;
					this.maxElementHeight = Math.max(this.maxElementHeight,layoutElement.preferredHeight);
				}
				justifyHeight = Math.ceil(Math.max(targetHeight,this.maxElementHeight));
			}
			var x:number = 0;
			var y:number = 0;
			var contentHeight:number = 0;
			var oldElementSize:number;
			var needInvalidateSize:boolean = false;
			//对可见区域进行布局
			for(var i:number=this.startIndex;i<=this.endIndex;i++){
				var exceesHeight:number = 0;
				layoutElement = <ILayoutElement> (this.target.getVirtualElementAt(i));
				if (!layoutElement){
					continue;
				}
				else if(!layoutElement.includeInLayout){
					this.elementSizeTable[i] = 0;
					continue;
				}
				if(justify){
					y = paddingT;
					layoutElement.setLayoutBoundsSize(NaN,justifyHeight);
				}
				else{
					exceesHeight = (targetHeight - layoutElement.layoutBoundsHeight)*vAlign;
					exceesHeight = exceesHeight>0?exceesHeight:0;
					y = paddingT+exceesHeight;
				}
				if(!contentJustify)
					this.maxElementHeight = Math.max(this.maxElementHeight,layoutElement.preferredHeight);
				contentHeight = Math.max(contentHeight,layoutElement.layoutBoundsHeight);
				if(!needInvalidateSize){
					oldElementSize = isNaN(this.elementSizeTable[i])?typicalWidth:this.elementSizeTable[i];
					if(oldElementSize!=layoutElement.layoutBoundsWidth)
						needInvalidateSize = true;
				}
				if(i==0&&this.elementSizeTable.length>0&&this.elementSizeTable[i]!=layoutElement.layoutBoundsWidth)
					this.typicalLayoutRect = null;
				this.elementSizeTable[i] = layoutElement.layoutBoundsWidth;
				x = this.getStartPosition(i);
				layoutElement.setLayoutBoundsPosition(Math.round(x),Math.round(y));
			}
			
			contentHeight += paddingT+paddingB;
			contentWidth = this.getStartPosition(numElements)-gap+paddingR;	
			this.target.setContentSize(Math.ceil(contentWidth),
				Math.ceil(contentHeight));
			if(needInvalidateSize||oldMaxH<this.maxElementHeight){
				this.target.invalidateSize();
			}
		}
		
		
		
		
		/**
		 * 更新使用真实布局的显示列表
		 */		
		private updateDisplayListReal(width:number,height:number):void{
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var paddingT:number = isNaN(this._paddingTop)?padding:this._paddingTop;
			var paddingB:number = isNaN(this._paddingBottom)?padding:this._paddingBottom;
			var gap:number = isNaN(this._gap)?0:this._gap;
			var targetWidth:number = Math.max(0, width - paddingL - paddingR);
			var targetHeight:number = Math.max(0, height - paddingT - paddingB);
			
			var hJustify:boolean = this._horizontalAlign==HorizontalAlign.JUSTIFY;
			var vJustify:boolean = this._verticalAlign==VerticalAlign.JUSTIFY||this._verticalAlign==VerticalAlign.CONTENT_JUSTIFY;
			var vAlign:number = 0;
			if(!vJustify){
				if(this._verticalAlign==VerticalAlign.MIDDLE){
					vAlign = 0.5;
				}
				else if(this._verticalAlign==VerticalAlign.BOTTOM){
					vAlign = 1;
				}
			}
			
			var count:number = this.target.numElements;
			var numElements:number = count;
			var x:number = paddingL;
			var y:number = paddingT;
			var i:number;
			var layoutElement:ILayoutElement;
			
			var totalPreferredWidth:number = 0;
			var totalPercentWidth:number = 0;
			var childInfoArray:Array = [];
			var childInfo:ChildInfo;
			var widthToDistribute:number = targetWidth;
			for (i = 0; i < count; i++){
				layoutElement = <ILayoutElement> (this.target.getElementAt(i));
				if (!layoutElement||!layoutElement.includeInLayout){
					numElements--;
					continue;
				}
				this.maxElementHeight = Math.max(this.maxElementHeight,layoutElement.preferredHeight);
				if(hJustify){
					totalPreferredWidth += layoutElement.preferredWidth;
				}
				else{
					if(!isNaN(layoutElement.percentWidth)){
						totalPercentWidth += layoutElement.percentWidth;
						
						childInfo = new ChildInfo();
						childInfo.layoutElement = layoutElement;
						childInfo.percent    = layoutElement.percentWidth;
						childInfo.min        = layoutElement.minWidth
						childInfo.max        = layoutElement.maxWidth;
						childInfoArray.push(childInfo);
						
					}
					else{
						widthToDistribute -= layoutElement.preferredWidth;
					}
				}
			}
			widthToDistribute -= gap * (numElements - 1);
			widthToDistribute = widthToDistribute>0?widthToDistribute:0;
			var excessSpace:number = targetWidth - totalPreferredWidth - gap * (numElements - 1);
			
			var averageWidth:number;
			var largeChildrenCount:number = numElements;
			var widthDic:Array = [];
			if(hJustify){
				if(excessSpace<0){
					averageWidth = widthToDistribute / numElements;
					for (i = 0; i < count; i++){
						layoutElement = this.target.getElementAt(i);
						if (!layoutElement || !layoutElement.includeInLayout)
							continue;
						
						var preferredWidth:number = layoutElement.preferredWidth;
						if (preferredWidth <= averageWidth){
							widthToDistribute -= preferredWidth;
							largeChildrenCount--;
							continue;
						}
					}
					widthToDistribute = widthToDistribute>0?widthToDistribute:0;
				}
			}
			else{
				if(totalPercentWidth>0){
					HorizontalLayout.flexChildrenProportionally(targetWidth,widthToDistribute,
						totalPercentWidth,childInfoArray);
					var roundOff:number = 0;
                    var length:number = childInfoArray.length;
					for (i=0;i<length;i++){
                        childInfo = childInfoArray[i];
						var childSize:number = Math.round(childInfo.size + roundOff);
						roundOff += childInfo.size - childSize;
						
						widthDic[childInfo.layoutElement.hashCode] = childSize;
						widthToDistribute -= childSize;
					}
					widthToDistribute = widthToDistribute>0?widthToDistribute:0;
				}
			}
			
			if(this._horizontalAlign==HorizontalAlign.CENTER){
				x = paddingL+widthToDistribute*0.5;
			}
			else if(this._horizontalAlign==HorizontalAlign.RIGHT){
				x = paddingL+widthToDistribute;
			}
			
			var maxX:number = paddingL;
			var maxY:number = paddingT;
			var dx:number = 0;
			var dy:number = 0;
			var justifyHeight:number = Math.ceil(targetHeight);
			if(this._verticalAlign==VerticalAlign.CONTENT_JUSTIFY)
				justifyHeight = Math.ceil(Math.max(targetHeight,this.maxElementHeight));
			roundOff = 0;
			var layoutElementWidth:number;
			var childWidth:number;
			for (i = 0; i < count; i++){
				var exceesHeight:number = 0;
				layoutElement = <ILayoutElement> (this.target.getElementAt(i));
				if (!layoutElement||!layoutElement.includeInLayout)
					continue;
				layoutElementWidth = NaN;
				if(hJustify){
					childWidth = NaN;
					if(excessSpace>0){
						childWidth = widthToDistribute * layoutElement.preferredWidth / totalPreferredWidth;
					}
					else if(excessSpace<0&&layoutElement.preferredWidth>averageWidth){
						childWidth = widthToDistribute / largeChildrenCount
					}
					if(!isNaN(childWidth)){
						layoutElementWidth = Math.round(childWidth + roundOff);
						roundOff += childWidth - layoutElementWidth;
					}
				}
				else{
					layoutElementWidth = widthDic[layoutElement.hashCode];
				}
				if(vJustify){
					y = paddingT;
					layoutElement.setLayoutBoundsSize(layoutElementWidth,justifyHeight);
				}
				else{
					var layoutElementHeight:number = NaN;
					if(!isNaN(layoutElement.percentHeight)){
						var percent:number = Math.min(100,layoutElement.percentHeight);
						layoutElementHeight = Math.round(targetHeight*percent*0.01);
					}
					layoutElement.setLayoutBoundsSize(layoutElementWidth,layoutElementHeight);
					exceesHeight = (targetHeight - layoutElement.layoutBoundsHeight)*vAlign;
					exceesHeight = exceesHeight>0?exceesHeight:0;
					y = paddingT+exceesHeight;
				}
				layoutElement.setLayoutBoundsPosition(Math.round(x),Math.round(y));
				dx = Math.ceil(layoutElement.layoutBoundsWidth);
				dy = Math.ceil(layoutElement.layoutBoundsHeight);
				maxX = Math.max(maxX,x+dx);
				maxY = Math.max(maxY,y+dy);
				x += dx+gap;
			}
			this.target.setContentSize(Math.ceil(maxX+paddingR),Math.ceil(maxY+paddingB));
		}
		
		/**
		 * 为每个可变尺寸的子项分配空白区域
		 */		
		public static flexChildrenProportionally(spaceForChildren:number,spaceToDistribute:number,
															totalPercent:number,childInfoArray:Array):void{
			
			var numChildren:number = childInfoArray.length;
			var done:boolean;
			
			do{
				done = true; 
				
				var unused:number = spaceToDistribute -
					(spaceForChildren * totalPercent / 100);
				if (unused > 0)
					spaceToDistribute -= unused;
				else
					unused = 0;
				
				var spacePerPercent:number = spaceToDistribute / totalPercent;
				
				for (var i:number = 0; i < numChildren; i++){
					var childInfo:ChildInfo = childInfoArray[i];
					
					var size:number = childInfo.percent * spacePerPercent;
					
					if (size < childInfo.min){
						var min:number = childInfo.min;
						childInfo.size = min;
						
						childInfoArray[i] = childInfoArray[--numChildren];
						childInfoArray[numChildren] = childInfo;
						
						totalPercent -= childInfo.percent;
						if (unused >= min){
							unused -= min;
						}
						else{
							spaceToDistribute -= min - unused;
							unused = 0;
						}
						done = false;
						break;
					}
					else if (size > childInfo.max){
						var max:number = childInfo.max;
						childInfo.size = max;
						
						childInfoArray[i] = childInfoArray[--numChildren];
						childInfoArray[numChildren] = childInfo;
						
						totalPercent -= childInfo.percent;
						if (unused >= max){
							unused -= max;
						}
						else{
							spaceToDistribute -= max - unused;
							unused = 0;
						}
						done = false;
						break;
					}
					else{
						childInfo.size = size;
					}
				}
			} 
			while (!done);
		}
		
		/**
		 * @inheritDoc
		 */
		public getElementBoundsLeftOfScrollRect(scrollRect:Rectangle):Rectangle{
			var rect:Rectangle = new Rectangle;
			if(!this.target)
				return rect;
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var firstIndex:number = this.findIndexAt(scrollRect.x,0,this.target.numElements-1);
			if(firstIndex==-1){
				
				if(scrollRect.x>this.target.contentWidth - paddingR){
					rect.x = this.target.contentWidth - paddingR;
					rect.right = this.target.contentWidth;
				}
				else{
					rect.x = 0;
					rect.right = paddingL;
				}
				return rect;
			}
			rect.x = this.getStartPosition(firstIndex);
			rect.right = this.getElementSize(firstIndex)+rect.x;
			if(rect.x==scrollRect.x){
				firstIndex--;
				if(firstIndex!=-1){
					rect.x = this.getStartPosition(firstIndex);
					rect.right = this.getElementSize(firstIndex)+rect.x;
				}
				else{
					rect.x = 0;
					rect.right = paddingL;
				}
			}
			return rect;
		}
		
		/**
		 * @inheritDoc
		 */
		public getElementBoundsRightOfScrollRect(scrollRect:Rectangle):Rectangle{
			var rect:Rectangle = new Rectangle;
			if(!this.target)
				return rect;
			var numElements:number = this.target.numElements;
			var padding:number = isNaN(this._padding)?0:this._padding;
			var paddingL:number = isNaN(this._paddingLeft)?padding:this._paddingLeft;
			var paddingR:number = isNaN(this._paddingRight)?padding:this._paddingRight;
			var lastIndex:number = this.findIndexAt(scrollRect.right,0,numElements-1);
			if(lastIndex==-1){
				if(scrollRect.right<paddingL){
					rect.x = 0;
					rect.right = paddingL;
				}
				else{
					rect.x = this.target.contentWidth - paddingR;
					rect.right = this.target.contentWidth;
				}
				return rect;
			}
			rect.x = this.getStartPosition(lastIndex);
			rect.right = this.getElementSize(lastIndex)+rect.x;
			if(rect.right<=scrollRect.right){
				lastIndex++;
				if(lastIndex<numElements){
					rect.x = this.getStartPosition(lastIndex);
					rect.right = this.getElementSize(lastIndex)+rect.x;
				}
				else{
					rect.x = this.target.contentWidth - paddingR;
					rect.right = this.target.contentWidth;
				}
			}
			return rect;
		}
		
	}

    class ChildInfo{

        public layoutElement:ILayoutElement;

        public size:number = 0;

        public percent:number;

        public min:number;

        public max:number;
    }
}