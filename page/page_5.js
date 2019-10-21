$(function(){
	//设置过滤编辑器
	var dg = $('#table5');   //要操作的datagrid
	var arr = [{
		field:'数量',         //设置数量列的过滤器
		type:'numberbox',
		options:{precision:0},
		op:['equal','less','greater']
	},{
		field:'日期',         //设置日期列的过滤器
		type:'datebox',
		op:['equal','notequal','less','greater']
	},{
		field:'产品ID',       //设置产品ID列的过滤器
		type:'combobox',
		options:{
			panelHeight:'auto',
			url:'dataList',
			queryParams:{
				tablename:'产品',
				cols:'产品ID,产品名称'
			},
			textField:'产品名称',
			valueField:'产品ID',
			onChange:function(value){
				if(value == ''){   //如果值为空串，就删除当前列的过滤规则，相当于取消筛选
					dg.datagrid('removeFilterRule', '产品ID');
				}else{          //否则就根据选择的值给当前列添加过滤规则
					dg.datagrid('addFilterRule', {
						field: '产品ID',
						op: 'equal',
						value: value
					});
				}
				dg.datagrid('doFilter');    //执行过滤
			}
		}
	}];
	//生成数据表
	var table = {
		tablename:'订单',
		cols:'产品ID,客户ID,单价,折扣,数量,日期'
	};
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据并进行个性处理
		data[0].splice(5,0,{  //在表头的第6个位置插入“金额”表达式列
			field:'金额',title:'金额',halign:'center',align:'right',width:'10',formatter:function(val,row){
				row.金额 = (row.单价*(1-row.折扣)*row.数量).toFixed(2);
				return (isNaN(row.金额)) ? '' : row.金额
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
		dg.datagrid({       //生成数据表
			border:false,
			fit:true,
			fitColumns:true,
			toolbar:'#table5_tool',    //绑定表格工具栏
			columns:data,
			url:'./../getTableData',
			queryParams:table,
			pagination:true,
			striped:true,
			rownumbers:true,
			singleSelect:true,
			clientPaging:false
		}).datagrid('enableFilter',arr) //将数组变量arr作为enableFilter方法的执行参数
	})
})