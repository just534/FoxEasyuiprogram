$(function(){
	//表格工具栏
	var editrow;
	var dg = $('#table11');
	$('#table11_tool>a').each(function(index){
		var txt,ico,fun;
		switch(index){
			case 0:
				txt = '增加菜单';
				ico = 'icon-add';
				fun = function(){
					$.getJSON('./../appendRow',{
						tablename:'菜单',   //指定要操作的表
						一级菜单:'',        //默认一级菜单
					},function(data){
						dg.datagrid('appendRow',data).datagrid('editCell',{    //默认编辑新增行的第1列
							index:dg.datagrid('getRows').length - 1,
							field:'一级菜单'
						})
					})
				}
				break;
			case 1:
				txt = '删除菜单';
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
										tablename:'菜单',
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
				}
				break;
			case 3:
				txt = '取消修改';
				ico = 'icon-cancel';
				fun = function(){
					dg.datagrid('cancelEdit',editrow)
				}
				break;
		};
		$(this).linkbutton({
			width:100,
			plain:true,
			text:txt,
			iconCls:ico,
			disabled:(index>1) ? true :false,
			onClick:fun
		})
	});
	//生成数据表
	var table = {
		tablename:'菜单',
		cols:'一级菜单,二级菜单,授权用户,小图标,大图标'
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据
		data[0].unshift({    //给表头加上复选列
			field:'ck',checkbox:true
		});
		$.extend(data[0][3],{      //给表头中的第4个列对象（授权用户）重新设置编辑器
			editor:{
				type:'combobox',
				options:{
					url:'dataList',
					queryParams:{
						tablename:'用户',
						cols:'用户名,照片'
					},
					textField:'用户名',
					valueField:'用户名',
					panelHeight:260,
					multiple:true,
					formatter:function(row){
						return row.用户名 + ((row.照片) ? '<br><img width=80 src="./../images/' + row.照片 + '">' : '')
					},
					loadFilter:function(data){
						var arr = [];
						data.forEach(function(obj){
							if(obj.用户名 != 'admin'){
								arr.push(obj)
							}
						})
						return arr
					}
				}
			}
		});
		dg.datagrid({       //生成数据表
			border:false,
			fit:true,
			fitColumns:true,
			toolbar:'#table11_tool',    //绑定表格工具栏
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
				editrow = index
			},
			onCellEdit:function(index,field){
				var cell = dg.datagrid('cell');
				var input = dg.datagrid('input',cell);
				input.keydown(function(e){
					if(e.keyCode == 13){
						dg.datagrid('endEdit',index);        //结束编辑
						if(field=='大图标'){                 //如果是最后一列，就跳到下一行的第一列
							dg.datagrid('gotoCell',{
								index:(index == dg.datagrid('getRows').length-1) ? 0 : index + 1,
								field:'一级菜单'
							})
						}else{          //否则向右跳转(跳转前必须先回到当前单元格)
							dg.datagrid('gotoCell',cell).datagrid('gotoCell','right')
						}
					}
				})
			},
			onEndEdit:function(index,row,changes){    //单元格编辑结束时执行的事件
				if(Object.keys(changes).length>0){    //检查单元格数值是否发生变化
					var obj = {
						tablename:'菜单',
						id:row.id
					};
					$.extend(obj,changes);            //将发生变化的单元格对象添加到obj中
					$.post('./../updateRow',obj)     //把对象发送到服务器以同步更新后台数据
				}
			},
			onAfterEdit:function(){
				buttonEnable(true)
			},
			onCancelEdit:function(){
				buttonEnable(true)
			}
		}).datagrid('enableCellEditing')	//禁止双击进入编辑且只能选择单元格
	});
	//按钮是否可用函数
	function buttonEnable(bool){
		$('#table11_tool>a').each(function(index){
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