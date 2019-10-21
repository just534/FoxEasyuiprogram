$(function(){
//表格工具栏
$('#table8_bt').linkbutton({
	iconCls:'icon-property',
	plain:true,
	onClick:function(){
		$('#table8').pivotgrid('layout')
	}
});
//生成默认透视表
var table = {
	tablename:'订单',
	cols:'产品ID,客户ID,雇员ID,单价,折扣,数量,日期'
};
$.getJSON('./../getTableData',table,function(data){
	$('#table8').pivotgrid({
		border:false,
		fit:true,
		toolbar:'#table8_tool',
		rownumbers:true,
		data:data.rows,
		pivot:{
			rows:['产品ID','客户ID'], //指定纵向分组列
			columns:['雇员ID'],       //指定横向分组列
			values:[                  //指定统计项目
				{field:'单价',title:'单价最高',op:'max'},  //单价和折扣都统计最大值
				{field:'折扣',title:'折扣最高',op:'max'},
				{field:'数量',title:'数量合计',op:'sum'}   //数量统计合计值，这里的op可以省略
			],
			filters:['产品ID','客户ID','雇员ID']  //设置过滤器
		},
		forzenColumnTitle:'分组列',      //指定纵向分组标题
		valueFormatter:function(value,row,index){   //设置统计值显示格式
			var str = this.field.slice(this.field.indexOf('_')+1);
			if(str=='单价' || str=='折扣'){
				return value>0 ? Number(value).toFixed(2) : ''
			}else{
				return value>0 ? value : ''
			}
		},
		i18n:{
			fields: '选择字段',
			filters: '过滤器',
			rows: '纵向分组列',
			columns: '横向分组列',
			values:'统计项目',
			ok: '统计',
			cancel: '取消'
		}
	}).pivotgrid('collapseAll')
});
})