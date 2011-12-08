package net.nan21.dnet.core.business.service;

import java.util.List;

import net.nan21.dnet.core.api.ISystemConfig;
import net.nan21.dnet.core.api.service.IEntityService;
import net.nan21.dnet.core.api.service.IEntityServiceFactory;

import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

/**
 * Service locator utility methods.
 * @author amathe
 */
public class ServiceLocatorBusiness {

	@Autowired
	protected ApplicationContext appContext;
 
	@Autowired
	protected ISystemConfig systemConfig;
	
	/**
	 * Find an entity service given the entity class and a list of factories.
	 * @param <E>
	 * @param entityClass
	 * @param factories
	 * @return
	 * @throws Exception
	 */
	public <E> IEntityService<E> findEntityService(Class<E> entityClass, List<IEntityServiceFactory> factories)
			throws Exception {
		for (IEntityServiceFactory esf : factories) {
			try {
				IEntityService<E> srv = esf.create(entityClass.getSimpleName()
						+ "Service"); // this.getEntityClass()
				if (srv != null) {
					srv.setSystemConfig(this.systemConfig);
					return srv;
				}
			} catch (NoSuchBeanDefinitionException e) {
				// service not found in this factory, ignore
			}
		}
		throw new Exception(entityClass.getSimpleName() + "Service"
				+ " not found ");
	}

	 
	 

	/**
	 * Getter for the spring application context.
	 * @return
	 */
	public ApplicationContext getAppContext() {
		return appContext;
	}

	/**
	 * Setter for the spring application context.
	 * @param appContext
	 */
	public void setAppContext(ApplicationContext appContext) {
		this.appContext = appContext;
	}

 
	public ISystemConfig getSystemConfig() {
		return systemConfig;
	}
 
	public void setSystemConfig(ISystemConfig systemConfig) {
		this.systemConfig = systemConfig;
	}
	
	
	
}
