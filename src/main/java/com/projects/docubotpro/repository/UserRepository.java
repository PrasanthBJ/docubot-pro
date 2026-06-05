package com.projects.docubotpro.repository;

import com.projects.docubotpro.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<Users,Long>{
}
