package net.nan21.dnet.core.api.service;

import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;

public interface IEntityService<E> {

	public EntityManager getEntityManager();
	public void setEntityManager(EntityManager em);
	
	public E findById(Object id) throws Exception;
	public List<E> findByIds(List<Object> ids) throws Exception;

	public E findByUk(String namedQueryName, Map<String, Object> params) throws Exception;

	public void deleteById(Object id) throws Exception;
	public void deleteByIds(List<Object> ids) throws Exception;

	public void insert(E e)  throws Exception;
	public void insert(List<E> list)  throws Exception;
	
	public void update(E e)  throws Exception;
	public void update(List<E> list)  throws Exception;
	
	public void delete(E e)  throws Exception;
	public void delete(List<E> list)  throws Exception;
	
}