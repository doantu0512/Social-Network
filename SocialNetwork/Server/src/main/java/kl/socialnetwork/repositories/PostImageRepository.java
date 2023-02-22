package kl.socialnetwork.repositories;

import kl.socialnetwork.domain.entities.PostImages;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostImageRepository extends JpaRepository<PostImages, String> {
}
