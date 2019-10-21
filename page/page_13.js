$(function(){
	//生成数据表
	var table = {
		tablename:'消息',
		cols:'标题,内容,接收用户,日期'
	};
	var username = $.cookie('user');
	if(username!='admin'){     //如果当前用户不是admin，就再加个过滤条件
		$.extend(table,{
			tj:"用户='" + usename + "'"
		})
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据
		$('#table13_table').datagrid({       //生成数据表
			border:false,
			fit:true,
			fitColumns:true,
			toolbar:'#table13_tool',    //绑定表格工具栏
			columns:data,
			url:'./../getTableData',
			queryParams:table,
			pagination:true,
			striped:true,
			rownumbers:true,
			idField:'id',
			singleSelect:true,
			onSelect:function(index,row){
				$('#table13_tt').textbox('setValue',row.标题);
				$('#table13_users').combobox('setValue',row.接收用户);
				$('#table13_con').textbox('setValue',row.内容)
			}
		})
	});
	//消息编辑区
	$('#table13_tt').textbox({
		label:'消息标题',
		width:'80%',
		labelWidth:66
	});
	$('#table13_users').combobox({
		label:'接收用户',
		prompt:'当需要发送给系统内的全部用户时可以不用输入！',
		width:'80%',
		labelWidth:66,
		url:'dataList',
		queryParams:{
			tablename:'用户',
			cols:'用户名'
		},
		textField:'用户名',
		valueField:'用户名',
		panelHeight:260,
		multiple:true
	});
	$('#table13_con').textbox({
		multiline:true,
		height:66,
		label:'消息内容',
		width:'80%',
		labelWidth:66
	}).css('float','left');
	$('#table13_bt').linkbutton({
		text:'提交消息',
		iconCls:'icon-save32',
		iconAlign:'top',
		size:'large',
		onClick:function(){
			var title = $('#table13_tt').textbox('getValue');
			var users = $('#table13_users').combobox('getValues').toString();
			var content = $('#table13_con').textbox('getValue');
			if(!title || !content){
				$.messager.alert('&nbsp;提示','消息标题及内容均不得为空！','warning').window({iconCls:'icon-logo'});
			}else{
				var row = $('#table13_table').datagrid('getSelected');
				var editrow = {
					标题:title,
					接收用户:users,
					内容:content,
					用户:username
				};
				if(row){
					$.messager.confirm('&nbsp;请确认','是否要保存为新消息？',function(r){
						if(r){
							row = $.extend({},editrow);
							saveMsg(row)
						}else{
							row = $.extend(row,editrow);
							saveMsg(row)
						};
					}).window({iconCls:'icon-logo'})
				}else{
					row = $.extend({},editrow)
					saveMsg(row);
				};
			}
		}
	}).css({
		'float':'right',
		'margin-right':'10px'
	})
	//保存消息
	function saveMsg(row){
		$.getJSON('./../saveMsg',row,function(data){
			if(row.id){
				$.extend(row,data);
				var index = $('#table13_table').datagrid('getRowIndex',row.id);
				$('#table13_table').datagrid('refreshRow',index)
			}else{
				$('#table13_table').datagrid('appendRow',data)
			}
		})
	}
})