$(function(){
	// var username = $.cookie('user');
	$('[region=north]>a:eq(0)').linkbutton({
		iconCls:'icon-tree2',
		onClick:function(){
			$('#table4_tree').tree('expandAll');
		},
		plain:true
	});
	$('[region=north]>a:eq(1)').linkbutton({
		iconCls:'icon-tree1',
		onClick:function(){
			$('#table4_tree').tree('collapseAll');
		},
		plain:true
	});
	//生成目录树
	$('#table4_tree').tree({
		url:'./../treedata',
		onClick:function(node){    //单击时生成数据表加载条件
			var parent = $(this).tree('getParent', node.target);
			if(parent){
				tj = "客户ID='" + node.text + "' and 产品ID='" + parent.text + "'"
			}else{
				tj = "产品ID='" + node.text + "'"
			}
			$('#table4_table').datagrid('reload',$.extend(table,{    //重载数据
				tj:tj
			}))
		},
		onLoadSuccess:function(){
			$(this).tree('collapseAll');	
		}
	});
	//生成数据表
	var table = {
		tablename:'订单',
		cols:'产品ID,客户ID,单价,折扣,数量,日期'
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据
		data[0].splice(5,0,{  //在表头的第6个位置插入“金额”表达式列
			field:'金额',title:'金额',halign:'center',align:'right',width:'10',formatter:function(val,row){
				row.金额 = (row.单价*(1-row.折扣)*row.数量).toFixed(2);
				return row.金额
			}
		});
		$.extend(data[0][2],{      //给表头中的第3个列对象（单价）设置显示格式
			formatter:function(val,row){
				return (val>0) ? Number(val).toFixed(2) : ''
			}
		});
		$.extend(data[0][3],{      //给表头中的第4个列对象（折扣）设置显示格式
			formatter:function(val,row){
				return (val>0) ? Number(val).toFixed(2) : ''
			}
		});
		data[0].forEach(function(obj){     //由于列数发生变化，重新给每列设置宽度
			if(obj.width)	obj.width = '14%'
		});
		$('#table4_table').datagrid({        //生成数据表
			border:false,
			fit:true,
			columns:data,
			url:'./../getTableData',
			queryParams:table,
			pagination:true,
			striped:true,
			rownumbers:true,
			singleSelect:true
		})
	});
})