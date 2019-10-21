$(function(){
	// var username = $.cookie('user');
	//表格工具栏
	$('#table12_dt').datebox({
		label:'查询日期',
		labelWidth:66,
	});
	$('#table12_cb').combobox({
		label:'&nbsp;&nbsp;使用功能',
		labelWidth:72,
		width:220,
		url:'./../getMenu',
		valueField:'text',
		groupField:'menu_1',
		groupFormatter:function(value){
			return '<span style="color:red;border-bottom:1px solid blue">' + value + '</span>'
		}
	});
	$('#table12_ck').checkbox({
		label:'&nbsp;&nbsp;本地排序',
		labelWidth:72,
		onChange:function(checked){
			$('#table12').datagrid('options').remoteSort = !checked
			// $('#table12').datagrid('reload');
		}
	});
	$('#table12_bt').linkbutton({
		iconCls:'icon-search',
		onClick:function(){
			var tj = '';
			if($('#table12_dt').val()){
				tj += " and 日期>=#" + $('#table12_dt').val() + " 00:00:00# and 日期<=#" + $('#table12_dt').val() + " 23:59:59#"
			};
			if($('#table12_cb').val()){
					tj += " and 项目='" + $('#table12_cb').val() + "'"
			};
			if(tj){
				tj = tj.slice(5)
			};
			$('#table12').datagrid('reload',$.extend(table,{
				tj:tj
			}));
		}
	});
	//生成数据表
	var table = {
		tablename:'日志',
		cols:'日期,项目,ip'
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据
		$('#table12').datagrid({        //获取成功后生成数据表
			border:false,
			fit:true,
			toolbar:'#table12_tool',    //绑定表格工具栏
			columns:data,
			url:'./../getTableData',
			queryParams:table,
			pagination:true,
			striped:true,
			rownumbers:true
		})
	});
})