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

/// <reference path="ICollection.ts"/>

module ns_egret {

	export interface ITreeCollection extends ICollection{
		/**
		 * 检查指定的节点是否含有子节点
		 * @param item 要检查的节点
		 */		
		hasChildren(item:any):boolean;

		/**
		 * 指定的节点是否打开
		 */		
		isItemOpen(item:any):boolean;

		/**
		 * 打开或关闭一个节点
		 * @param item 要打开或关闭的节点
		 * @param open true表示打开节点，反之关闭。
		 */		
		expandItem(item:any,open:boolean=true):void;

		/**
		 * 获取节点的深度
		 */		
		getDepth(item:any):number;
	}
}