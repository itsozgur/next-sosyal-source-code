function getFeedbackUserMeta() {
  const usernameMeta = document.querySelector('meta[name="feedback-user-username"]');
  const tenantMeta = document.querySelector('meta[name="feedback-user-tenant"]');
  const dynamicUrl = document.querySelector('meta[name="feedback-user-dynamic-url"]');
  return {
    username: usernameMeta ? usernameMeta.content : null,
    tenant: tenantMeta ? tenantMeta.content : null,
    dynamicUrl: dynamicUrl ? dynamicUrl.content : null
  };
}

document.addEventListener('DOMContentLoaded', function() {

    const FEEDBACK_USER = getFeedbackUserMeta();

    const allowedExtensions = [
      "jpg", "jpeg", "png", "webp", "gif", "svg", "bmp",
      "mp4", "mov", "avi", "wmv", "flv", "mkv", "webm", "mpeg"
    ];


    const ratingOptions = document.querySelectorAll('.feedback-form__emoji-label');
    const ratingInput = document.querySelector('input[name="user[feedback_rating]"]');
    const slider = document.querySelector('.feedback-form__slider');
    const progressBar = document.querySelector('.feedback-form__slider-progress');
    const feedbackForm = document.querySelector('.feedback-form');




    const subjectField = document.getElementById('feedback_subject');
    const descriptionField = document.getElementById('feedback_comment');


    function showModal(title, message, isSuccess) {
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';

      const modalContainer = document.createElement('div');
      modalContainer.className = 'modal-container';

      const modalHeader = document.createElement('div');
      modalHeader.className = 'modal-header';
      modalHeader.className += isSuccess ? ' modal-success' : ' modal-error';

      const modalTitle = document.createElement('h3');
      modalTitle.textContent = title;

      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      closeButton.textContent = '×';

      const modalBody = document.createElement('div');
      modalBody.className = 'modal-body';
      modalBody.textContent = message;

      const modalFooter = document.createElement('div');
      modalFooter.className = 'modal-footer';

      const okButton = document.createElement('button');
      okButton.className = 'modal-button';
      okButton.textContent = 'Tamam';

      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(closeButton);
      modalFooter.appendChild(okButton);
      modalContainer.appendChild(modalHeader);
      modalContainer.appendChild(modalBody);
      modalContainer.appendChild(modalFooter);
      modalOverlay.appendChild(modalContainer);
      document.body.appendChild(modalOverlay);

      closeButton.addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
      });
      okButton.addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
      });
      modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
          document.body.removeChild(modalOverlay);
        }
      });

      modalOverlay.style.position = 'fixed';
      modalOverlay.style.top = '0';
      modalOverlay.style.left = '0';
      modalOverlay.style.right = '0';
      modalOverlay.style.bottom = '0';
      modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      modalOverlay.style.display = 'flex';
      modalOverlay.style.justifyContent = 'center';
      modalOverlay.style.alignItems = 'center';
      modalOverlay.style.zIndex = '1000';
      modalContainer.style.backgroundColor = '#282c37';
      modalContainer.style.borderRadius = '8px';
      modalContainer.style.maxWidth = '500px';
      modalContainer.style.width = '90%';
      modalContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
      modalHeader.style.padding = '15px';
      modalHeader.style.display = 'flex';
      modalHeader.style.justifyContent = 'space-between';
      modalHeader.style.alignItems = 'center';
      modalHeader.style.borderBottom = '1px solid #393f4f';
      if (isSuccess) {
        modalHeader.style.backgroundColor = '#2b90d9';
      } else {
        modalHeader.style.backgroundColor = '#2b90d9';
      }
      modalHeader.style.borderRadius = '8px 8px 0 0';
      modalHeader.style.color = 'white';
      modalTitle.style.margin = '0';
      modalTitle.style.fontSize = '18px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '22px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = 'white';
      modalBody.style.padding = '15px';
      modalBody.style.color = '#d9e1e8';
      modalFooter.style.padding = '15px';
      modalFooter.style.textAlign = 'right';
      modalFooter.style.borderTop = '1px solid #393f4f';
      okButton.style.backgroundColor = '#2b90d9';
      okButton.style.color = 'white';
      okButton.style.border = 'none';
      okButton.style.padding = '8px 16px';
      okButton.style.borderRadius = '4px';
      okButton.style.cursor = 'pointer';
    }


    async function sendFeedbackToAPI(data) {
      try {
        const formData = new FormData();

        if (!FEEDBACK_USER || !FEEDBACK_USER.username || !FEEDBACK_USER.tenant) {
          showModal('Hata', 'Kullanıcı oturum bilgisi bulunamadı. Lütfen sayfayı yenileyin.', false);
          return { success: false, error: 'Kullanıcı oturum bilgisi eksik' };
        }
        formData.append('username', FEEDBACK_USER.username);
        formData.append('tenant', FEEDBACK_USER.tenant);
        formData.append('title', data.title);
        formData.append('message', data.message);
        formData.append('rating', data.rating);

        if (data.file && data.file.files && data.file.files.length > 0) {
          const fileName = data.file.files[0].name;
          const extension = fileName.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(extension)) {
            showModal(
              'Hatalı Dosya Türü',
              'İzin verilen dosya türleri: jpg, jpeg, png, webp, gif, svg, bmp, mp4, mov, avi, wmv, flv, mkv, webm, mpeg.',
              false
            );
            return { success: false, error: 'Hatalı dosya türü' };
          }
          formData.append('file', data.file.files[0]);

        }
        const response = await fetch(`${FEEDBACK_USER.dynamicUrl}/api/support/feedback/`, {
          method: 'POST',
          body: formData
        });

        if (response.status === 201 || response.ok) {
          const result = await response.json();
          return { success: true, data: result };
        } else {
          throw new Error('API yanıtı başarısız: ' + response.status);
        }

      } catch (error) {
        console.error('API hatası:', error);
        return { success: false, error: error.message };
      }
    }

    function updateProgressBar(value) {
      if (progressBar) {
        const percent = ((value - 1) / 4) * 100;
        progressBar.style.width = percent + '%';
      }
    }

    function updateSelectedEmoji(value) {
      ratingOptions.forEach(opt => opt.classList.remove('feedback-form__emoji-label--selected'));
      const selectedIndex = parseInt(value) - 1;
      if (selectedIndex >= 0 && selectedIndex < ratingOptions.length) {
        ratingOptions[selectedIndex].classList.add('feedback-form__emoji-label--selected');
        if (ratingInput) {
          ratingInput.value = value;
        }
      }
    }


    if (slider && progressBar) {
      updateProgressBar(slider.value);
      updateSelectedEmoji(slider.value);
      slider.addEventListener('input', function() {
        updateProgressBar(this.value);
        updateSelectedEmoji(this.value);
      });
    }

    ratingOptions.forEach(option => {
      option.addEventListener('click', function() {
        ratingInput.value = this.dataset.value;
        updateSelectedEmoji(this.dataset.value);
        if (slider) {
          slider.value = this.dataset.value;
          updateProgressBar(this.dataset.value);
        }

      });
    });


    if (feedbackForm) {
      feedbackForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        let isValid = true;
        let errorMessages = [];
        if (!ratingInput.value) {
          errorMessages.push('Lütfen bir değerlendirme seçin');
          isValid = false;
        }
        if (!subjectField.value.trim()) {
          errorMessages.push('Lütfen bir konu giriniz');
          isValid = false;
        }
        if (!descriptionField.value.trim()) {
          errorMessages.push('Lütfen açıklama girin');
          isValid = false;
        }

        const fileInput = document.getElementById('feedback_file');
        if (fileInput && fileInput.files.length > 0) {
          const fileName = fileInput.files[0].name;
          const extension = fileName.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(extension)) {
            errorMessages.push('İzin verilen dosya türleri: jpg, jpeg, png, webp, gif, svg, bmp, mp4, mov, avi, wmv, flv, mkv, webm, mpeg.');
            isValid = false;
          }
        }

        if (!isValid) {
          if (errorMessages.length > 0) {
            showModal('Hata', errorMessages.join(', '), false);
          }
          return false;
        }
        const emojiRating = ratingInput.value;
        const subject = subjectField.value;
        const description = descriptionField.value;

        const feedbackData = {
          title: subject,
          message: description,
          rating: parseInt(emojiRating),
          file: fileInput
        };
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Gönderiliyor...';

        try {
          const result = await sendFeedbackToAPI(feedbackData);
          if (result && result.success) {
            showModal('Başarılı', 'Geribildiriminiz başarıyla gönderildi. Teşekkür ederiz!', true);
            this.reset();
            if (slider) {
              slider.value = 1;
              updateProgressBar(1);
              updateSelectedEmoji(1);
            }
            const defaultPlaceholder = document.querySelector('.feedback-form__file-name-placeholder').getAttribute('data-default') ||
              "Dosya seçilmedi";
            document.querySelector('.feedback-form__file-name-placeholder').textContent = defaultPlaceholder;
          } else {
            showModal('Hata', 'Geribildirim gönderilirken bir hata oluştu: ' + (result && result.error ? result.error : "Bilinmeyen hata"), false);
          }
        } catch (error) {
          console.error('İstek hatası:', error);
          showModal('Hata', 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.', false);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }

    // Handle file input display
    const fileInputDisplay = document.querySelector('.feedback-form__file-input');
    const fileNameDisplay = document.querySelector('.feedback-form__file-name-placeholder');
    if (fileNameDisplay) {
      fileNameDisplay.setAttribute('data-default', fileNameDisplay.textContent);
    }
    if (fileInputDisplay) {
      fileInputDisplay.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const fileName = this.files[0].name;
          const extension = fileName.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(extension)) {
            showModal(
              'Hatalı Dosya Türü',
              'İzin verilen dosya türleri: jpg, jpeg, png, webp, gif, svg, bmp, mp4, mov, avi, wmv, flv, mkv, webm, mpeg.',
              false
            );
            this.value = ""; // input'u sıfırla
            fileNameDisplay.textContent = fileNameDisplay.getAttribute('data-default') || "Dosya seçilmedi";
            return;
          }
          fileNameDisplay.textContent = fileName;

        } else {
          fileNameDisplay.textContent = fileNameDisplay.getAttribute('data-default') || "Dosya seçilmedi";

        }
      });
    }
});
