$(function(){
	//表格工具栏
	var editrow;
	var dg = $('#table10');
	$('#table10_tool>a').each(function(index){
		var txt,ico,fun;
		switch(index){
			case 0:
				txt = '增加用户';
				ico = 'icon-add';
				fun = function(){
					$.getJSON('./../appendRow',{
						tablename:'用户',   //指定要操作的表
						用户名:'',          //默认用户名
					},function(data){
						dg.datagrid('appendRow',data).datagrid('editCell',{    //默认编辑新增行的第1列
							index:dg.datagrid('getRows').length - 1,
							field:'用户名'
						})
					})
				}
				break;
			case 1:
				txt = '删除用户';
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
										tablename:'用户',
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
	//上传元素对象（隐藏的）
	$('#table10_upload').filebox({
		accept:'image/*',
		onChange: function(){
			var files = $(this).filebox('files');
			if(files.length>0){            //如果选择了文件
				$(this).parent().form({    //必须对当前input元素的父元素（也就是form）使用表单方法
					url:'./../upload',
					success:function(data){
						var row = dg.datagrid('getRows')[editrow];
						$.post('./../updateRow',{
							tablename:'用户',
							id:row.id,
							照片:files[0].name
						},function(){
							$.messager.alert('&nbsp;提示',data,'info',function(){
								dg.datagrid('updateRow',{
									index:editrow,
									row:{照片:files[0].name}
								}).datagrid('editCell',{
									index:editrow,
									field:'照片'
								})
							}).window({iconCls:'icon-logo'});
						});
					}
				}).form('submit')
			}
		}
	});
	//生成数据表
	var table = {
		tablename:'用户',
		cols:'用户名,密码,照片,资料'
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据
		data[0].unshift({    //给表头加上复选列
			field:'ck',checkbox:true
		});
		$.extend(data[0][3],{      //给表头中的第4个列对象（照片）重新设置编辑器
			editor:{
				type:'textbox',
				options:{
					buttonText:'…',
					editable:false,
					onClickButton: function(){
						var fileId = $('#table10_upload').filebox('options').fileboxId;
						$('#' + fileId)[0].click();
					},
					inputEvents:{         //文本框事件设置
						keydown:function(e){
							if(e.ctrlKey){           //按下ctrl键时弹出窗口
								$(e.data.target).textbox('button').click()
							}
						}
					}
				}
			}
		});
		$.extend(data[0][4],{      //给表头中的第5个列对象（资料）重新设置编辑器
			editor:{
				type:'textbox',
				options:{
					buttonText:'…',
					editable:false,
					onClickButton: function(){
						var ed = $(this);
						$('<div id="tmp"></div>').dialog({
							title:'&nbsp;请输入该用户相关资料',
							modal:true,
							iconCls:'icon-logo',
							width:480,
							height:320,
							content:'<input id="tmp_input">',
							buttons:[{
								text:'确定',
								iconCls:'icon-accept',
								handler:function(e){
									ed.textbox('setValue',$('#tmp_input').textbox('getValue'));
									$('#tmp').dialog('close')
								}
							}],
							onClose:function(){
								$(this).dialog('destroy');
								ed.textbox('textbox').focus()
							}
						}).css('padding','10px');
						$('#tmp_input').textbox({
							multiline:true,
							fit:true,
							value:ed.textbox('getValue')
						}).textbox('textbox').focus()
					},
					inputEvents:{         //文本框事件设置
						keydown:function(e){
							if(e.ctrlKey){           //按下ctrl键时弹出窗口
								$(e.data.target).textbox('button').click()
							}
						}
					}
				}
			}
		});
		dg.datagrid({       //生成数据表
			border:false,
			fit:true,
			fitColumns:true,
			toolbar:'#table10_tool',    //绑定表格工具栏
			columns:data,
			url:'./../getTableData',
			queryParams:$.extend(table,{
				tj:"用户名<>'admin'"
			}),
			pagination:true,
			striped:true,
			rownumbers:true,
			idField:'id',
			view:detailview,
			detailFormatter:function(index,row){
				var zp = (row.照片) ? '<img width="100px" src="./../images/' + row.照片 + '">' : '照片暂缺';
				zp = '<td style="border:0px;padding:10px 5px">' + zp + '</td>';
				var zl = (row.资料) ? row.资料 : '资料暂缺';
				zl = '<td style="border:0px;padding:10px 5px">' + zl + '</td>';
				var str = '<table style="width:90%"><tr>' + zp + zl + '</tr></table>';
				return str
			},
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
					if(e.keyCode == 13){           //回车时跳转单元格
						dg.datagrid('endEdit',index);        //必须先结束编辑，否则没办法跳转
						if(field=='资料'){                   //如果是最后一列，就跳到下一行的第一列
							dg.datagrid('gotoCell',{
								index:(index == dg.datagrid('getRows').length-1) ? 0 : index + 1,
								field:'用户名'
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
						tablename:'用户',
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
		}).datagrid('enableCellEditing')	//启用单元格编辑
	});
	//按钮是否可用函数
	function buttonEnable(bool){
		$('#table10_tool>a').each(function(index){
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