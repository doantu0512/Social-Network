package kl.socialnetwork.services;

import kl.socialnetwork.domain.models.bindingModels.message.MessageCreateBindingModel;
import kl.socialnetwork.domain.models.serviceModels.MessageServiceModel;
import kl.socialnetwork.domain.models.viewModels.message.MessageFriendsViewModel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MessageService {

    MessageServiceModel createMessage(MessageCreateBindingModel messageCreateBindingModel, String loggedInUsername) throws Exception;

    MessageServiceModel createMessage(MultipartFile [] images,String toUserId, String loggedInUsername) throws Exception;

    List<MessageServiceModel> getAllMessages(String loggedInUsername, String chatUserId);

    List<MessageFriendsViewModel> getAllFriendMessages(String loggedInUsername);
}
