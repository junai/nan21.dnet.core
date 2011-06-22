package net.nan21.dnet.core.api.action;

import net.nan21.dnet.core.api.descriptor.IDsDescriptor;

public interface IQueryBuilder<F,P> {

	/**
	 * Add fetch limit constraint. <br>
	 * Fetch <code>resultSize</code> number of results starting from <code>resultStart</code> position.
	 * @param resultStart
	 * @param resultSize
	 * @return this
	 */
	public IQueryBuilder addFetchLimit(int resultStart, int resultSize);
	/**
	 * Add sort information. The number of elements in the two arrays must be the same.
	 * @param columnList Array of field names E.g. {"name", "code"}
	 * @param senseList Array of sense E.g. {"asc", "desc"}
	 * @return this
	 */
	public IQueryBuilder addSortInfo(String[] columnList, String[] senseList);
	/**
	 * Add sort information. The number of elements in the strings must be the same.
	 * @param columns Comma delimited column names E.g. "name,code"
	 * @param sense Comma delimited column names E.g. "asc,desc"
	 * @return this
	 */
	public IQueryBuilder addSortInfo(String columns, String sense);
	/**
	 * Add sort information. 
	 * @param sortTokens The sort tokens E.g. {"name", "code desc", "id asc"}
	 * @return this
	 */
	public IQueryBuilder addSortInfo(String[] sortTokens);
	 
	public Class<?> getFilterClass();
 
	public Class<?> getParamClass();
 
	public F getFilter();


	public void setFilter(F filter);


	public P getParams();


	public void setParams(P params);


	public IDsDescriptor getDescriptor();


	public void setDescriptor(IDsDescriptor descriptor);
}