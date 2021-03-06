package net.nan21.dnet.core.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import net.nan21.dnet.core.api.session.Session;
import net.nan21.dnet.core.api.setup.IStartupParticipant;

/**
 * Global system configuration properties, values injected from properties file.
 * 
 * @author amathe
 * 
 */
public class SystemConfig implements ISystemConfig, ApplicationContextAware {

	private ApplicationContext applicationContext;

	/**
	 * Disable the use of fetch groups. Temporary parameter as workaround for
	 * bug https://bugs.eclipse.org/bugs/show_bug.cgi?id=337115 When using
	 * Oracle database should set to true, possibly with other databases.
	 */
	private boolean disableFetchGroups = true;

	/**
	 * Specify working mode as development or production.
	 */
	private String workingMode = ISystemConfig.WORKING_MODE_DEV;

	/**
	 * Temporary parameter to link the portal content to the specified client
	 * Although the back-end is a multi-tenant architecture, the front-end
	 * portal currently is not multi-site
	 */
	private String portalClientCode;
	private String portalClientId;

	private Map<String, Map<String, String>> sysParams;

	public boolean isDisableFetchGroups() {
		return disableFetchGroups;
	}

	public void setDisableFetchGroups(boolean disableFetchGroups) {
		this.disableFetchGroups = disableFetchGroups;
	}

	public String getWorkingMode() {
		return workingMode;
	}

	public void setWorkingMode(String workingMode) {
		this.workingMode = workingMode;
	}

	public boolean shouldCacheDescriptor() {
		return workingMode.equals(WORKING_MODE_PROD);
	}

	public void addSysParam(String client, String paramName, String paramValue) {
		if (this.sysParams == null) {
			this.sysParams = new HashMap<String, Map<String, String>>();
		}
		if (!this.sysParams.containsKey(client)) {
			this.sysParams.put(client, new HashMap<String, String>());
		}

		Map<String, String> paramMap = this.sysParams.get(client);
		paramMap.put(paramName, paramValue);
	}

	/**
	 * Update a parameter value of the current user's client.
	 * 
	 * @param paramName
	 * @param paramValue
	 */
	public void setSysParamValue(String paramName, String paramValue) {
		addSysParam(Session.user.get().getClientCode(), paramName, paramValue);
	}

	/**
	 * Get a parameter value of the current user's client.
	 * 
	 * @param paramName
	 * @return
	 * @throws Exception
	 */
	public String getSysParamValue(String paramName) throws Exception {
		return this.getSysParamValue(paramName, null);
	}

	/**
	 * Get a parameter value of the current user's client.
	 * 
	 * @param paramName
	 * @return
	 * @throws Exception
	 */
	public String getSysParamValue(String paramName, String defaultValue)
			throws Exception {
		if (this.sysParams == null) {
			loadSysparams();
		}
		try {
			String client = Session.user.get().getClientCode();
			Map<String, String> values = this.sysParams.get(client);
			if (!values.containsKey(paramName)) {
				return defaultValue;
			} else {
				return values.get(paramName);
			}
		} catch (Exception e) {
			return defaultValue;
		}
	}

	public Map<String, String> getSysParams() throws Exception {
		if (this.sysParams == null) {
			this.loadSysparams();
		}
		try {
			String client = Session.user.get().getClientCode();
			return this.sysParams.get(client);
		} catch (Exception e) {
			return null;
		}

	}

	synchronized private void loadSysparams() throws Exception {
		@SuppressWarnings("unchecked")
		List<IStartupParticipant> participants = (List<IStartupParticipant>) this.applicationContext
				.getBean("osgiStartupParticipants");
		for (IStartupParticipant startupParticipant : participants) {
			startupParticipant.execute();
		}
	}

	public void reloadSysparams() throws Exception {
		this.loadSysparams();
	}

	public ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	public void setApplicationContext(ApplicationContext applicationContext) {
		this.applicationContext = applicationContext;
	}

	public String getPortalClientCode() {
		return portalClientCode;
	}

	public void setPortalClientCode(String portalClientCode) {
		this.portalClientCode = portalClientCode;
	}

	public String getPortalClientId() {
		return portalClientId;
	}

	public void setPortalClientId(String portalClientId) {
		this.portalClientId = portalClientId;
	}

}
