package net.nan21.dnet.core.api.action;

import java.util.List;

public interface IActionResultFind extends IActionResult {

	public Long getTotalCount();

	public void setTotalCount(Long totalCount);

	public List<?> getData();

	public void setData(List<?> data);

	public Object getParams();

	public void setParams(Object params);

}
