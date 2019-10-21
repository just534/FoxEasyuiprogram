$(function(){
	//表格工具栏
	$('#table3_ipt').searchbox({
		width:280,
		prompt:'请输入查询关键字',
		menu:'#mm',
		searcher:function(value,name){
			if(!value){
				$.messager.alert('&nbsp;提示','请注意：查询关键字不得为空！','warning',function(){
					$('#table3_ipt').searchbox('textbox').focus()
				}).window({iconCls:'icon-logo'});
			}else{
				var tj;
				switch(name){
					case 'cp':
						tj = "产品ID like '%" + value + "%'";
						break;
					case 'kh':
						tj = "客户ID like '%" + value + "%'";
						break;
					case 'and':
						tj = "产品ID like '%" + value + "%' and 客户ID like '%" + value + "%'";
						break;
					case 'or':
						tj = "产品ID like '%" + value + "%' or 客户ID like '%" + value + "%'";
						break;
				};
				$('#table3').datagrid('reload',$.extend(table,{
					tj:tj
				}));
			}
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
			if(obj.width)	obj.width = 100
		});
		$('#table3').datagrid({        //生成数据表
			border:false,
			fit:true,
			toolbar:'#table3_tool',    //绑定表格工具栏
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