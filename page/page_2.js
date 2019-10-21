var row,rowIndex,udm;    //row表示操作行，rowIndex表示行位置，udm表示数据更新标记
var table = {            //要加载的后台数据表及数据列
	tablename:'订单',
	cols:'产品ID,客户ID,单价,折扣,数量,日期'
};
var dg = $('#table2');   //客户端用于生成表的jQuery对象
$(function(){            //页面准备好之后执行
	//表格工具栏
	$('#table2_open').linkbutton({
		width:100,
		plain:true,
		text:'打开窗口',
		iconCls:'icon-edit',
		onClick:function(){
			if($('#table2_dlg').length){
				$('#table2_dlg').dialog('open');
				rowAct()    //执行行操作函数
			}else{
				$('#table2_tmp').load('./page/page_2_dlg.html',function(){
					$('#table2_dlg').dialog({
						title:'&nbsp;数据录入窗口',
						iconCls:'icon-logo',
						width:600,
						height:306,
						toolbar:'#table2_tb',
						buttons:'#table2_bt',
						modal:true
					});
					$('#table2_bt>a').each(function(index){
						var txt,ico,fun;
						switch(index){
							case 0:
								txt = '增加记录';
								ico = 'icon-add';
								fun = function(){
									dg.datagrid('clearSelections');
									rowAct()
								};
								break;
							case 1:
								txt = '删除记录';
								ico = 'icon-remove';
								fun = function(){
									$.messager.confirm('&nbsp;请确认','确定要删除当前记录吗？',function(r){
										if(r){
											row = dg.datagrid('getSelected');   //获取当前选中行
											$.post('./../deleteRow',{
												tablename:'订单',
												ids:row.id
											},function(data){
												dg.datagrid('deleteRow',rowIndex);
												var count = dg.datagrid('getRows').length;
												if(count == 0){   //如果当前页全部记录数量为0，就关闭录入窗口
													$('#table2_dlg').dialog('close')
												}else{
													if(count > rowIndex){
														dg.datagrid('selectRow',rowIndex)
													}else{
														dg.datagrid('selectRow',rowIndex-1)
													}
												};
												$.messager.alert('&nbsp;提示',data,'info').window({iconCls:'icon-logo'});
											})
										}
									}).window({iconCls:'icon-logo'})
								}
								break;
							case 2:
								txt = '首条';
								ico = 'icon-first';
								fun = function(){
									dg.datagrid('selectRow',0)
								};
								break;
							case 3:
								txt = '上一条';
								ico = 'icon-prev';
								fun = function(){
									dg.datagrid('selectRow',rowIndex - 1)
								};
								break;
							case 4:
								txt = '下一条';
								ico = 'icon-next';
								fun = function(){
									dg.datagrid('selectRow',rowIndex + 1)
								};
								break;
							case 5:
								txt = '尾条';
								ico = 'icon-last';
								fun = function(){
									dg.datagrid('selectRow',dg.datagrid('getRows').length - 1)
								};
								break;
						};
						$(this).linkbutton({
							width:(index>1) ? 80 : 90,
							plain:true,
							text:txt,
							iconCls:ico,
							onClick:fun
						})
					});
					$('#table2_con>div').css({
						'float':'left',
						'margin':'6px 10px'
					});
					$('#table2_cp').combobox({    //第1个编辑框属性
						label:'产品ID&nbsp;&nbsp;',
						labelWidth:58,
						width:234,
						url:'dataList',
						queryParams:{
							tablename:'产品',
							cols:'产品ID,产品名称'
						},
						textField:'产品名称',
						valueField:'产品ID',
						panelHeight:180
					}).combobox('textbox').keydown(function(e){
						if(e.keyCode==13) $('#table2_kh').combobox('textbox').focus()
					});
					$('#table2_kh').combobox({    //第2个编辑框属性
						label:'客户ID&nbsp;&nbsp;',
						labelWidth:58,
						width:234,
						url:'dataList',
						queryParams:{
							tablename:'客户',
							cols:'客户ID,客户名称'
						},
						textField:'客户名称',
						valueField:'客户ID',
						panelHeight:180
					}).combobox('textbox').keydown(function(e){
						if(e.keyCode==13) $('#table2_dj').numberbox('textbox').focus()
					});
					$('#table2_dj').numberbox({    //第3个编辑框属性
						label:'单&nbsp;&nbsp;价&nbsp;&nbsp;',
						labelWidth:58,
						width:234,
						precision:2
					}).numberbox('textbox').keydown(function(e){
						if(e.keyCode==13) $('#table2_zk').numberbox('textbox').focus()
					});
					$('#table2_zk').numberbox({    //第4个编辑框属性
						label:'折&nbsp;&nbsp;扣&nbsp;&nbsp;',
						labelWidth:58,
						width:234,
						precision:2
					}).numberbox('textbox').keydown(function(e){
						if(e.keyCode==13) $('#table2_sl').numberbox('textbox').focus()
					});
					$('#table2_sl').numberbox({    //第5个编辑框属性
						label:'数&nbsp;&nbsp;量&nbsp;&nbsp;',
						labelWidth:58,
						width:234
					}).numberbox('textbox').keydown(function(e){
						if(e.keyCode==13) $('#table2_rq').datebox('textbox').focus()
					});
					$('#table2_je').numberbox({    //第6个编辑框属性
						label:'金&nbsp;&nbsp;额&nbsp;&nbsp;',
						labelWidth:58,
						width:234,
						editable:false,
						precision:2
					});
					$('#table2_rq').datebox({      //第7个编辑框属性
						label:'日&nbsp;&nbsp;期&nbsp;&nbsp;',
						labelWidth:58,
						width:234,
						editable:false
					}).datebox('textbox').keydown(function(e){
						if(e.keyCode==13) $('#table2_cp').combobox('textbox').focus()
					});
					$('#table2_con').form({   //设置表单
						onLoadSuccess:function(){
							udm = true;       //表单数据加载以后，将udm设置为true
						},
						onChange:function(target){
							if(udm){    //只有当udm为true时才触发更新事件
								var col = $(target).attr('textboxname');
								var value = $(target).val();
								row = dg.datagrid('getSelected');   //获取当前行
								row[col] = value;   //使用变量作为对象的键名，用于更新表格中的数据
								dg.datagrid('refreshRow',rowIndex);    //刷新表格数据行，以更新表格中的金额
								if('单价,折扣,数量'.indexOf(col)>-1){
									$('#table2_je').numberbox('setValue',row.金额);  //更新表单中的金额数据
								};
								if(col != '金额'){   //如果发生变化的不是金额列，就同步更新后台数据
									$.getJSON('./../updateRow',{
										tablename:'订单',
										id:row.id,
										[col]:value    //这里也是使用变量作为键名的！！
									});
								}
							}
						}
					});
					rowAct()    //执行行操作函数
				});
			}
		}
	});
	//生成数据表
	$.getJSON('./../getTableTitles',table,function(data){     //获取表头数据并进行个性处理
		data[0].unshift({    //给表头加上复选列
			field:'ck',checkbox:true
		});
		data[0].splice(6,0,{  //在表头的第7个位置插入“金额”表达式列
			field:'金额',title:'金额',halign:'center',align:'right',width:'10',formatter:function(val,row){
				row.金额 = (row.单价*(1-row.折扣)*row.数量).toFixed(2);
				return (isNaN(row.金额)) ? '' : row.金额
			}
		});
		$.extend(data[0][3],{      //给表头中的第4个列对象（单价）设置显示格式
			formatter:function(val,row){
				return (val>0) ? Number(val).toFixed(2) : ''
			}
		});
		$.extend(data[0][4],{      //给表头中的第5个列对象（折扣）设置显示格式
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
			toolbar:'#table2_tool',    //绑定表格工具栏
			columns:data,
			url:'./../getTableData',
			queryParams:table,
			pagination:true,
			striped:true,
			rownumbers:true,
			singleSelect:true,
			idField:'id',
			onDblClickRow:function(index,row){
				$('#table2_open').click()
			},
			onSelect:function(index,row){
				rowIndex = index;      //将行位置保存到rowIndex
				udm = undefined;       //将udm设置为undefined，以避免触发表单的onChange事件
				$('#table2_con').form('load',row);    //以当前行内容重载表单数据
			}
		})
	});
});
//行记录操作函数
function rowAct(){
	row = dg.datagrid('getSelected');   //获取选中记录行
	var rowsel = true;
	if(row){     //如果有选中行
		rowIndex = dg.datagrid('getRowIndex',row);   //获取选中记录行的位置
		if(rowIndex==-1){      //如果是在其他页选中
			dg.datagrid('clearSelections');
		}else{
			$('#table2_con').form('load',row);    //将选中行的值添加到表单
			rowsel = false
		}
	};
	if(rowsel){      //如没有选中行或者在其他页中选中行
		$.getJSON('./../appendRow',{
			tablename:'订单',   //指定要操作的表
			产品ID:'P01'        //默认产品ID，也可同时指定其他列的默认值
		},function(data){
			var fmArr = table.cols.split(',');    //列数组
			fmArr.forEach(function(v){            //必须添加其他列内容以方便表单数据load
				if(!(v in data)){
					data[v] = null
				}
			});
			dg.datagrid('appendRow',data).datagrid('selectRecord',data.id);  //添加新行并选中它
		})
	};
}