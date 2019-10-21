/*本示例的数据编辑全部是在datagrid表内完成的，
因此需要用到datagrid中的各种编辑事件！
*/
$(function(){
	var dg = $('#table1');
	var editrow;
	//表格工具栏
	$('#table1_tool>a').each(function(index){
		var txt,ico,fun;
		switch(index){
			case 0:
				txt = '增加记录';
				ico = 'icon-add';
				fun = function(){
					$.getJSON('./../appendRow',{
						tablename:'订单',   //指定要操作的表
						产品ID:'P01',       //默认产品ID
						客户ID:'C01',       //默认客户ID
						折扣:0.5            //默认折扣
					},function(data){
						dg.datagrid('appendRow',data).datagrid('editCell',{    //默认编辑新增行的第1列
							index:dg.datagrid('getRows').length - 1,
							field:'产品ID'
						})
					})
				};
				break;
			case 1:
				txt = '删除记录';
				ico = 'icon-remove';
				fun = function(){
					var rows = dg.datagrid('getChecked');
					if(rows.length == 0){
						$.messager.alert('&nbsp;提示','请先勾选要删除的记录行！','warning').window({iconCls:'icon-logo'});
					}else{
						$.messager.confirm('&nbsp;请确认','确定要删除这些选定行吗？',function(r){
							if(r){
								var ids = [];
								for(var i = rows.length-1;i>=0;i--){    //删除多条记录时要从后往前删除
									var index = dg.datagrid('getRowIndex',rows[i].id);
									if(index >= 0){    //其他页的勾选记录位置为-1
										ids.push(Number(rows[i].id));
										dg.datagrid('deleteRow',index);
									}
								}
								if(ids.length){
									$.post('./../deleteRow',{
										tablename:'订单',
										ids:ids.toString()
									},function(data){
										$.messager.alert('&nbsp;提示',data,'info').window({iconCls:'icon-logo'});
									})
								}
							}
						}).window({iconCls:'icon-logo'})
					}
				};
				break;
			case 2:
				txt = '保存修改';
				ico = 'icon-save';
				fun = function(){
					dg.datagrid('endEdit',editrow)
				};
				break;
			case 3:
				txt = '取消修改';
				ico = 'icon-cancel';
				fun = function(){
					dg.datagrid('cancelEdit',editrow)
				};
				break;
		};
		$(this).linkbutton({
			width:100,
			plain:true,
			text:txt,
			iconCls:ico,
			disabled:(index>1) ? true : false,
			onClick:fun
		})
	});
	//生成数据表
	var table = {
		tablename:'订单',
		cols:'产品ID,客户ID,单价,折扣,数量,日期'
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据并进行个性处理
		data[0].unshift({    //给表头加上复选列
			field:'ck',checkbox:true
		});
		$.extend(data[0][1],{      //给表头中的第2个列对象（产品ID）重新设置编辑器属性
			editor:{
				type:'combobox',
				options:{
					url:'dataList',
					queryParams:{
						tablename:'产品',
						cols:'产品ID,产品名称'
					},
					required:true,
					validType:'length[1,5]',    
					textField:'产品名称',
					valueField:'产品ID',
					panelHeight:180
				}
			}
		});
		$.extend(data[0][2],{      //给表头中的第3个列对象（客户ID）重新设置编辑器属性
			editor:{
				type:'combobox',
				options:{
					url:'dataList',
					queryParams:{
						tablename:'客户',
						cols:'客户ID,客户名称'
					},
					required:true,
					textField:'客户名称',
					valueField:'客户ID',
					panelHeight:180,
					panelWidth:280
				}
			}
		});
		data[0].splice(6,0,{  //在表头的第7个位置插入“金额”表达式列
			field:'金额',title:'金额',halign:'center',align:'right',width:'10',editor:{
				type:'numberbox',
				options:{editable:false}
			},formatter:function(val,row){
				row.金额 = (row.单价*(1-row.折扣)*row.数量).toFixed(2);
				return isNaN(row.金额) ? '' : row.金额
			}
		});
		$.extend(data[0][3],{      //给表头中的第4个列对象（单价）设置显示格式
			formatter:function(val,row){
				return (val>0) ? Number(val).toFixed(2) : ''
			},
			editor:{
				type:'numberbox',
				options:{precision:2}
			}
		});
		$.extend(data[0][4],{      //给表头中的第5个列对象（折扣）设置显示格式
			formatter:function(val,row){
				return (val>0) ? Number(val).toFixed(2) : ''
			},
			editor:{
				type:'numberbox',
				options:{
					precision:2,
					max:1,       //折扣最大为1
					min:0        //折扣最小为0
				}
			}
		});
		data[0].forEach(function(obj){     //由于列数发生变化，重新给每列设置宽度
			if(obj.width)	obj.width = 100
		});
		dg.datagrid({       //生成数据表
			border:false,
			fit:true,
			fitColumns:true,
			toolbar:'#table1_tool',    //绑定表格工具栏
			columns:data,
			url:'./../getTableData',
			queryParams:table,
			pagination:true,
			striped:true,
			rownumbers:true,
			idField:'id',
			onBeforeEdit:function(index,row){
				buttonEnable(false)
			},
			onBeginEdit:function(index,row){
				editrow = index;
			},
			onCellEdit:function(index,field){
				var cell = dg.datagrid('cell');
				var input = dg.datagrid('input',cell);
				input.keydown(function(e){
					if(e.keyCode == 13){
						dg.datagrid('endEdit',index);        //结束编辑
						if(field=='日期'){                   //如果是最后一列，就跳到下一行的第一列
							dg.datagrid('gotoCell',{
								index:(index == dg.datagrid('getRows').length-1) ? 0 : index + 1,
								field:'产品ID'
							})
						}else{          //否则向右跳转(跳转前必须先回到当前单元格)
							dg.datagrid('gotoCell',cell).datagrid('gotoCell','right')
						}
					}
				})
			},
			onEndEdit:function(index,row,changes){    //单元格编辑结束时执行的事件
				if(Object.keys(changes).length>0){    //检查单元格数值是否发生变化
					if(!changes.金额){                //只有非金额列数据发生变化时才请求后台同步更新数据
						var obj = {
							tablename:'订单',
							id:row.id
						};
						$.extend(obj,changes);            //将发生变化的单元格对象添加到obj中
						$.post('./../updateRow',obj)     //把对象发送到服务器以同步更新后台数据
					}
				}
			},
			onAfterEdit:function(index,row,changes){
				buttonEnable(true)
			},
			onCancelEdit:function(index,row){
				buttonEnable(true)
			},
		}).datagrid('enableCellEditing')	//启用单元格编辑
	});
	//按钮是否可用函数
	function buttonEnable(bool){
		$('#table1_tool>a').each(function(index){
			if(index>1){
				$(this).linkbutton({
					disabled:bool
				})
			}else{
				$(this).linkbutton({
					disabled:!bool
				})
			}
		})
	}
})