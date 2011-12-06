package net.nan21.dnet.core.api.setup;

import java.util.Iterator;
import java.util.List;

import net.nan21.dnet.core.api.SystemConfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

public abstract class AbstractSetupParticipant {

	@Autowired
	protected ApplicationContext appContext;

	protected String targetName;
	protected List<ISetupTask> tasks;

	protected SystemConfig systemConfig;
	
	protected int ranking;

	public boolean hasWorkToDo() {
		if (tasks == null) {
			this.init();
		}
		return this.tasks.size() > 0;
	}

	protected abstract void init();

	public List<ISetupTask> getTasks() {
		if (tasks == null) {
			this.init();
		}
		return this.tasks;
	}

	public String getTargetName() {
		return targetName;
	}

	public void setTargetName(String targetName) {
		this.targetName = targetName;
	}

	public String getBundleId() {
		return this.appContext.getId();
	}

	public ISetupTask getTask(String taskId) {
		Iterator<ISetupTask> it = tasks.iterator();
		while (it.hasNext()) {
			ISetupTask t = it.next();
			if (t.getId().equals(taskId)) {
				return t;
			}
		}
		return null;
	}

	public ApplicationContext getAppContext() {
		return appContext;
	}

	public void setAppContext(ApplicationContext appContext) {
		this.appContext = appContext;
	}

	protected void beforeExecute() throws Exception {

	}

	public void execute() throws Exception {
		this.beforeExecute();
		this.onExecute();
		this.afterExecute();
	}

	protected void afterExecute() throws Exception {

	}

	protected abstract void onExecute() throws Exception;

	public int getRanking() {
		return ranking;
	}

	public void setRanking(int ranking) {
		this.ranking = ranking;
	}

	public int compareTo(ISetupParticipant sp) {
		return sp.getRanking() - this.ranking;
	}

	public SystemConfig getSystemConfig() {
		return systemConfig;
	}

	public void setSystemConfig(SystemConfig systemConfig) {
		this.systemConfig = systemConfig;
	}
	
	
	
}
